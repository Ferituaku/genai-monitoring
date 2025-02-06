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
                        "ServiceName": service_name,
                        "Environment": environment
                    }
                    
                    projects[project_key]["chatSessions"].append(chat_session)
                    projects[project_key]["totalRequests"] += 1

            return jsonify(list(projects.values()))
        
        except Exception as e:
            print(f"Error occurred: {str(e)}")
            return jsonify({"error": str(e)}), 500

api.add_resource(ProjectChatService, '/yuhu')

if __name__ == '__main__':
    app.run(debug=True, port=5000)