from flask import Flask, jsonify, request
from flask_restful import Api, Resource
import clickhouse_connect
from flask_cors import CORS

app = Flask(__name__)
# CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}})

api = Api(app)

client =  clickhouse_connect.get_client(host='openlit.my.id', port='8123', database="openlit", username='default',password='OPENLIT',
        secure=False  # Menghindari session locking
    )


class ProjectChatService(Resource):
    def get(self):
        try:
            query = """
WITH chat_counts AS (
    SELECT 
        SpanAttributes['UniqueIDChat'] AS UniqueIDChat,
        COUNT(DISTINCT SpanAttributes['ChatID']) AS MessageCount
    FROM openlit.otel_traces
    WHERE SpanAttributes['UniqueIDChat'] IS NOT NULL
        AND SpanAttributes['UniqueIDChat'] != ''  -- Exclude empty strings
    GROUP BY UniqueIDChat
),
chat_sessions AS (
    SELECT 
        ServiceName,
        ResourceAttributes['deployment.environment'] AS Environment,
        SpanAttributes['UniqueIDChat'] AS UniqueIDChat,
        MIN(Timestamp) AS Timestamp,
        chat_counts.MessageCount AS TotalMessages
    FROM openlit.otel_traces
    JOIN chat_counts ON chat_counts.UniqueIDChat = SpanAttributes['UniqueIDChat']
    WHERE 
        ServiceName IS NOT NULL 
        AND ResourceAttributes['deployment.environment'] IS NOT NULL
        AND SpanAttributes['UniqueIDChat'] IS NOT NULL
        AND SpanAttributes['UniqueIDChat'] != ''  -- Exclude empty strings
    GROUP BY 
        ServiceName,
        Environment,
        UniqueIDChat,
        chat_counts.MessageCount
)
SELECT 
    ServiceName,
    Environment,
    UniqueIDChat,
    toString(Timestamp) AS Timestamp,
    TotalMessages
FROM chat_sessions
ORDER BY Timestamp DESC
            """
            
            result = client.query(query).result_rows
            
            projects = {}
            for row in result:
                service_name, environment, unique_id_chat, timestamp, total_messages = row
                project_key = f"{service_name}-{environment}"
                
                if project_key not in projects:
                    projects[project_key] = {
                        "serviceName": service_name,
                        "environment": environment,
                        "totalRequests": 0,
                        "chatSessions": []
                    }
                
                # Only add sessions with non-empty UniqueIDChat
                if unique_id_chat and unique_id_chat.strip():
                    chat_session = {
                        "UniqueIDChat": unique_id_chat,
                        "Timestamp": timestamp,
                        "TotalMessages": total_messages,
                    }
                    
                    projects[project_key]["chatSessions"].append(chat_session)
                    projects[project_key]["totalRequests"] += 1

            return jsonify(list(projects.values()))
        
        except Exception as e:
            print(f"Error occurred: {str(e)}")
            return jsonify({"error": str(e)}), 500

# class ChatHistoryService(Resource):
#     def get(self):
#         try:
#             # Mengambil UniqueIDChat dari parameter URL
#             unique_id_chat = request.args.get("UniqueIDChat")

#             if not unique_id_chat:
#                 return jsonify({"error": "UniqueIDChat parameter is required"}), 400

#             # Query ClickHouse
#             query = f"""
#                 SELECT 
#                     (Timestamp) AS Tanggal,
#                     SpanAttributes['ChatID'] AS ChatID,
#                     SpanAttributes['Prompt'] AS Pertanyaan,
#                     SpanAttributes['Answer'] AS Jawaban
#                 FROM openlit.otel_traces
#                 WHERE SpanAttributes['UniqueIDChat'] = '{unique_id_chat}'
#                 ORDER BY Timestamp DESC
#             """

#             # Jalankan query
#             result = client.query(query).result_rows

#             if not result:
#                 return jsonify({"message": "No data found for the given UniqueIDChat"}), 404

#             # Format hasil menjadi JSON
#             formatted_traces = [
#                 {
#                     "Tanggal": row[0],
#                     "ChatID": row[1],
#                     "Pertanyaan": row[2],
#                     "Jawaban": row[3]
#                 }
#                 for row in result
#             ]

#             return jsonify(formatted_traces)

#         except Exception as e:
#             return jsonify({"error": str(e)}), 500

class ChatHistoryService(Resource):
    def get(self, unique_id_chat):
        try:
            if not unique_id_chat:
                return jsonify({"error": "UniqueIDChat parameter is required"}), 400

            # Query untuk mendapatkan informasi service dan environment
            service_query = f"""
                SELECT DISTINCT
                    ServiceName,
                    ResourceAttributes['deployment.environment'] AS Environment
                FROM openlit.otel_traces
                WHERE SpanAttributes['UniqueIDChat'] = '{unique_id_chat}'
                LIMIT 1
            """
            
            service_info = client.query(service_query).result_rows
            
            if not service_info:
                return jsonify({"error": "Chat session not found"}), 404
                
            service_name, environment = service_info[0]

            # Query untuk chat history
            history_query = f"""
                SELECT 
                    Timestamp AS Tanggal,
                    SpanAttributes['ChatID'] AS ChatID,
                    SpanAttributes['Prompt'] AS Pertanyaan,
                    SpanAttributes['Answer'] AS Jawaban
                FROM openlit.otel_traces
                WHERE SpanAttributes['UniqueIDChat'] = '{unique_id_chat}'
                ORDER BY Timestamp ASC
            """

            chat_history = client.query(history_query).result_rows
            
            # Hitung total messages
            total_messages = len(chat_history)

            # Format response
            formatted_history = [
                {
                    "Timestamp": str(row[0]),
                    "ChatID": row[1],
                    "Pertanyaan": row[2],
                    "Jawaban": row[3]
                }
                for row in chat_history
            ]

            response_data = {
                "UniqueIDChat": unique_id_chat,
                "ServiceName": service_name,
                "Environment": environment,
                "TotalMessages": total_messages,
                "ChatHistory": formatted_history
            }

            return jsonify(response_data)

        except Exception as e:
            return jsonify({"error": str(e)}), 500

api.add_resource(ProjectChatService, '/api/projectchat')
api.add_resource(ChatHistoryService, '/api/chathistory/<string:unique_id_chat>')

if __name__ == '__main__':
    app.run(debug=True, port=5001)