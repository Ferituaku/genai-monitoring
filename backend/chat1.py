from flask import Flask, jsonify
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

class ProjectChatService(Resource):
    def get(self):
        try:
            # First, get all unique chat sessions with their details
            query = """
            WITH chat_sessions AS (
                SELECT 
                    ServiceName,
                    ResourceAttributes['deployment.environment'] AS Environment,
                    SpanAttributes['UniqueIDChat'] AS UniqueIDChat,
                    MIN(Timestamp) AS Timestamp,
                    COUNT(*) AS TotalMessages
                FROM openlit.otel_traces
                WHERE 
                    ServiceName IS NOT NULL 
                    AND ResourceAttributes['deployment.environment'] IS NOT NULL
                    AND SpanAttributes['UniqueIDChat'] IS NOT NULL
                GROUP BY 
                    ServiceName,
                    Environment,
                    UniqueIDChat
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
                
                # Add chat session details
                chat_session = {
                    "UniqueIDChat": unique_id_chat,
                    "Timestamp": timestamp,
                    "TotalMessages": total_messages,
                    "ServiceName": service_name,
                    "Environment": environment
                }
                
                projects[project_key]["chatSessions"].append(chat_session)
                projects[project_key]["totalRequests"] += 1

            return jsonify(list(projects.values()))
        
        except Exception as e:
            print(f"Error occurred: {str(e)}")  # Add logging for debugging
            return jsonify({"error": str(e)}), 500

api.add_resource(ProjectChatService, '/api/projectchat')

if __name__ == '__main__':
    app.run(debug=True, port=5000)