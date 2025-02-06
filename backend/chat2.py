from flask import Flask, jsonify, request
from flask_restful import Api, Resource
import clickhouse_connect
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
api = Api(app)

client = clickhouse_connect.get_client(
    host='openlit.my.id', 
    port='8123', 
    database="openlit", 
    username='default',
    password='OPENLIT',
    secure=False
)

class ChatHistoryService(Resource):
    def get(self):
        try:
            unique_id_chat = request.args.get('UniqueIDChat')
            if not unique_id_chat:
                return jsonify({"error": "UniqueIDChat is required"}), 400

            # Get session details
            session_query = """
            SELECT 
                SpanAttributes['UniqueIDChat'] as UniqueIDChat,
                ServiceName,
                ResourceAttributes['deployment.environment'] as Environment,
                COUNT(*) as TotalMessages
            FROM openlit.otel_traces
            WHERE SpanAttributes['UniqueIDChat'] = %(unique_id_chat)s
            GROUP BY 
                UniqueIDChat,
                ServiceName,
                Environment
            LIMIT 1
            """
            
            session_result = client.query(session_query, parameters={'unique_id_chat': unique_id_chat}).result_rows
            
            if not session_result:
                return jsonify({"error": "Chat session not found"}), 404
                
            session_data = {
                "UniqueIDChat": session_result[0][0],
                "ServiceName": session_result[0][1],
                "Environment": session_result[0][2],
                "TotalMessages": session_result[0][3],
                "ChatHistory": []
            }

            # Get chat messages
            messages_query = """
            SELECT 
                toString(Timestamp) as Timestamp,
                SpanAttributes['UniqueIDChat'] as ChatID,
                SpanAttributes['Question'] as Pertanyaan,
                SpanAttributes['Answer'] as Jawaban
            FROM openlit.otel_traces
            WHERE 
                SpanAttributes['UniqueIDChat'] = %(unique_id_chat)s
                AND SpanAttributes['Question'] IS NOT NULL
                AND SpanAttributes['Answer'] IS NOT NULL
            ORDER BY Timestamp ASC
            """
            
            messages_result = client.query(messages_query, parameters={'unique_id_chat': unique_id_chat}).result_rows
            
            # Format chat messages
            chat_history = []
            for msg in messages_result:
                chat_message = {
                    "Timestamp": msg[0],
                    "ChatID": msg[1],
                    "Pertanyaan": msg[2],
                    "Jawaban": msg[3]
                }
                chat_history.append(chat_message)
            
            session_data["ChatHistory"] = chat_history
            
            return jsonify(session_data)

        except Exception as e:
            print(f"Error occurred: {str(e)}")  # Add logging for debugging
            return jsonify({"error": str(e)}), 500

# Add the new endpoint
api.add_resource(ChatHistoryService, '/api/chathistory/<string:unique_id_chat>')

if __name__ == '__main__':
    app.run(debug=True, port=5001)