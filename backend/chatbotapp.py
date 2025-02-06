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
            # Query untuk mengambil informasi project dan chat sessions
            query = """
            SELECT 
                ServiceName,
                ResourceAttributes['deployment.environment'] AS Environment,
                COUNT(DISTINCT SpanAttributes['UniqueIDChat']) AS TotalChatSessions,
                groupArray(
                    (
                        SpanAttributes['UniqueIDChat'],
                        toString(min(Timestamp)),
                        COUNT(*) AS MessageCount
                    )
                ) AS ChatSessionDetails
            FROM openlit.otel_traces
            WHERE 
                ServiceName IS NOT NULL 
                AND ResourceAttributes['deployment.environment'] IS NOT NULL
                AND SpanAttributes['UniqueIDChat'] IS NOT NULL
            GROUP BY ServiceName, Environment
            """
            
            # Jalankan query
            result = client.query(query).result_rows
            
            # Format hasil menjadi struktur yang diinginkan
            projects = []
            for row in result:
                service_name, environment, total_chat_sessions, chat_session_details = row
                
                # Parse chat session details
                chat_sessions = []
                for session in chat_session_details:
                    unique_id_chat, timestamp, total_messages = session
                    chat_sessions.append({
                        "UniqueIDChat": unique_id_chat,
                        "Timestamp": timestamp,
                        "ServiceName": service_name,
                        "Environment": environment,
                        "TotalMessages": total_messages
                    })
                
                projects.append({
                    "serviceName": service_name,
                    "environment": environment,
                    "totalRequests": total_chat_sessions,
                    "chatSessions": chat_sessions
                })
            
            return jsonify(projects)
        
        except Exception as e:
            return jsonify({"error": str(e)}), 500

class ChatHistoryService(Resource):
    def get(self):
        try:
            unique_id_chat = request.args.get("UniqueChat")
            if not unique_id_chat:
               return jsonify({"error":"UniqueIDChat parameter is required"}), 400
            # Query untuk narik history / riwayat chat tiap session pada satu app/project
            query = f"""
             SELECT 
                Timestamp, 
                SpanAttributes['ChatID'] AS ChatID, 
                SpanAttributes['Prompt'] AS Pertanyaan, 
                SpanAttributes['Answer'] AS Jawaban,
                ServiceName,
                ResourceAttributes['deployment.environment'] AS Environment
            FROM openlit.otel_traces 
            WHERE 
                SpanAttributes['UniqueIDChat'] = '{unique_id_chat}'
            ORDER BY Timestamp ASC
            """
           

            result = client.query(query).result_rows

            if not result:
                return jsonify({"message": "No chat history found for the given UniqueIDChat"}), 404
            
            # Format hasil 
            chat_history = []
            for row in result:
                timestamp, chat_id, pertanyaan, jawaban, service_name, environment = row
                chat_history.append({
                    "Timestamp": timestamp,
                    "ChatID": chat_id,
                    "Pertanyaan": pertanyaan,
                    "Jawaban": jawaban
                })
            
            # Tambahkan metadata tambahan
            response_data = {
                "UniqueIDChat": unique_id_chat,
                "ServiceName": service_name,
                "Environment": environment,
                "TotalMessages": len(chat_history),
                "ChatHistory": chat_history
            }
            
            return jsonify(response_data)
        
        except Exception as e:
            return jsonify({"error": str(e)}), 500

api.add_resource(ProjectChatService, '/api/projectchat')
api.add_resource(ChatHistoryService, '/api/chathistory')

if __name__ == '__main__':
    app.run(debug=True)