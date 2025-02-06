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
WITH  
    chat_counts AS (
        SELECT 
            SpanAttributes['UniqueIDChat'] AS UniqueIDChat,
            COUNT(SpanAttributes['ChatID']) AS MessageCount
        FROM openlit.otel_traces
        WHERE SpanAttributes['UniqueIDChat'] IS NOT NULL
        GROUP BY UniqueIDChat
    )
SELECT 
    t.ServiceName,
    t.ResourceAttributes['deployment.environment'] AS Environment,
    COUNT(DISTINCT t.SpanAttributes['UniqueIDChat']) AS TotalChatSessions,
    groupArray(
        tuple(
            CASE(UniqueIDChatCount > 1 THEN 
            t.SpanAttributes['UniqueIDChat'],
            t.Timestamp,
            cc.MessageCount,)
            COUNT(SpanAttributes['UniqueIDChat'] = SpanAttributes['UniqueIDChat'] ) AS UniqueIDChatCount
        )
    ) AS ChatSessionDetails
FROM openlit.otel_traces t
JOIN chat_counts cc ON t.SpanAttributes['UniqueIDChat'] = cc.UniqueIDChat
WHERE 
    t.ServiceName IS NOT NULL 
    AND t.ResourceAttributes['deployment.environment'] IS NOT NULL
    AND t.SpanAttributes['UniqueIDChat'] IS NOT NULL
    AND t.SpanAttributes['UniqueIDChat'] != ''
GROUP BY t.ServiceName, Environment
HAVING COUNT(DISTINCT t.SpanAttributes['UniqueIDChat']) > 0


            """
            result = client.query(query).result_rows
            
            formatted_traces = [
                {
                    "ServiceName": row[0],
                    "Environment": row[1],
                    "TotalChatSessions": row[2],
                    "ChatSessionDetails": [
                        {
                            "UniqueIDChat": chat[0],
                            "StartTime": chat[1],
                            "MessageCount": chat[2]
                        }
                        for chat in row[3]
                    ]
                }
                for row in result
            ]

            return jsonify(formatted_traces)
        
        except Exception as e:
            return jsonify({"error": str(e)})


# Menambahkan endpoint ke Flask
api.add_resource(ProjectChatService, '/yuhu')

if __name__ == '__main__':
    app.run(debug=True)
