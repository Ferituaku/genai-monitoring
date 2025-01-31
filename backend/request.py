from flask import Flask, jsonify, request, abort
from flask_restful import Api, Resource, reqparse, marshal_with, fields
import clickhouse_connect
from datetime import datetime, timedelta
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
api = Api(app)

# ClickHouse Client
client = clickhouse_connect.get_client(
    host='openlit.my.id',
    port=8123,
    database='openlit',
    username='default',
    password='OPENLIT'
)

# Define resource fields for marshalling
trace_fields = {
    'timestamp': fields.String,
    'trace_id': fields.String,
    'app_name': fields.String,
    'operation_name': fields.String,
    'attributes': fields.Raw
}

class Traces(Resource):
    @marshal_with(trace_fields)
    def get(self, appName=None):
        try:
            if appName:
                query = f"SELECT * FROM otel_traces WHERE ServiceName = '{appName}' ORDER BY Timestamp DESC"
            else:
                query = 'SELECT * FROM otel_traces ORDER BY Timestamp DESC'
                
            traces = client.query(query).result_rows
            return self.format_traces(traces)
        except Exception as e:
            abort(500, f"Internal Server Error: {str(e)}")

    @staticmethod
    def format_traces(traces):
        formatted_data = []
        for row in traces:
            try:
                # Extract data from additional_info
                additional_info = row[11] if isinstance(row[11], dict) else {}
                
                # Extract prompt and completion from content arrays
                content_types = row[14] if len(row) > 14 else []
                content_values = row[15] if len(row) > 15 else []
                
                prompt = ""
                completion = ""
                
                # Match content types with their values
                for i, content_type in enumerate(content_types):
                    if content_type == 'gen_ai.content.prompt' and i < len(content_values):
                        prompt = content_values[i].get('gen_ai.prompt', '')
                    elif content_type == 'gen_ai.content.completion' and i < len(content_values):
                        completion = content_values[i].get('gen_ai.completion', '')

                # Calculate duration safely
                duration = "0s"
                try:
                    if isinstance(row[13], list) and len(row[13]) >= 2:
                        start_time = row[13][0]
                        end_time = row[13][1]
                        if isinstance(start_time, datetime) and isinstance(end_time, datetime):
                            duration = f"{(end_time - start_time).total_seconds():.2f}s"
                except Exception as e:
                    print(f"Error calculating duration: {e}")

                # Format attributes based on frontend requirements
                attributes = {
                    'model': additional_info.get('gen_ai.request.model', ''),
                    'completion_tokens': int(float(additional_info.get('gen_ai.usage.output_tokens', 0))),
                    'prompt_tokens': int(float(additional_info.get('gen_ai.usage.input_tokens', 0))),
                    'total_tokens': int(float(additional_info.get('gen_ai.usage.total_tokens', 0))),
                    'cost': f"${float(additional_info.get('gen_ai.usage.cost', 0)):.10f}",
                    'duration': duration,
                    'prompt': prompt,
                    'completion': completion
                }
                
                formatted_data.append({
                    "timestamp": row[0].isoformat(),
                    "trace_id": row[1],
                    "app_name": row[7],
                    "operation_name": row[5],
                    "attributes": attributes
                })
            except (IndexError, AttributeError, ValueError) as e:
                print(f"Error formatting row: {e}")
                continue
        return formatted_data

api.add_resource(Traces, '/api/traces/', '/api/traces/<string:appName>')

if __name__ == '__main__':
    app.run(debug=True)