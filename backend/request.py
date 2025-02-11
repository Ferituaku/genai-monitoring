from flask import Flask, jsonify, abort, request
from flask_restful import Api, Resource
import clickhouse_connect
from datetime import datetime, timedelta
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
api = Api(app)

client = clickhouse_connect.get_client(
    host='openlit.my.id',
    port=8123,
    database='openlit',
    username='default',
    password='OPENLIT'
)

class Request(Resource):
    def get(self, appName=None):  
        try:
            # Parameter dasar
            days = request.args.get('days', default=7, type=int)
            
            # Parameter filter
            deployment_environment = request.args.get('deployment_environment', default=None, type=str)
            system = request.args.get('system', default=None, type=str)
            model = request.args.get('model', default=None, type=str)
            operation_name = request.args.get('operation_name', default=None, type=str)
            endpoint = request.args.get('endpoint', default=None, type=str)
            min_input_tokens = request.args.get('min_input_tokens', default=None, type=int)
            max_input_tokens = request.args.get('max_input_tokens', default=None, type=int)
            min_output_tokens = request.args.get('min_output_tokens', default=None, type=int)
            max_output_tokens = request.args.get('max_output_tokens', default=None, type=int)
            min_total_tokens = request.args.get('min_total_tokens', default=None, type=int)
            max_total_tokens = request.args.get('max_total_tokens', default=None, type=int)
            min_duration = request.args.get('min_duration', default=None, type=float)
            max_duration = request.args.get('max_duration', default=None, type=float)
            is_stream = request.args.get('is_stream', default=None, type=str)
            
            # Hitung tanggal mulai
            start_date = datetime.now() - timedelta(days=days)
            
            # Query dasar dengan subquery
            query = """
            WITH filtered_data AS (
                SELECT 
                    Timestamp,
                    TraceId,
                    SpanId,
                    ParentSpanId,
                    TraceState,
                    SpanName,
                    SpanKind,
                    ServiceName,
                    ResourceAttributes,
                    ScopeName,
                    ScopeVersion,
                    SpanAttributes,
                    Duration,
                    StatusCode,
                    StatusMessage,
                    Events.Timestamp, 
                    Events.Name, 
                    Events.Attributes
                FROM otel_traces 
                WHERE StatusCode IN ('STATUS_CODE_OK', 'STATUS_CODE_UNSET')
                AND Timestamp >= '{start_date}'
            """

            # Filter berdasarkan appName
            if appName:
                query += f" AND ServiceName = '{appName}'"
            
            # Filter dari ResourceAttributes
            if deployment_environment:
                query += f" AND ResourceAttributes['deployment.environment'] = '{deployment_environment}'"

            # Filter dari SpanAttributes
            if system:
                query += f" AND SpanAttributes['gen_ai.system'] = '{system}'"
            
            if model:
                query += f" AND SpanAttributes['gen_ai.request.model'] = '{model}'"
            
            if operation_name:
                query += f" AND SpanAttributes['gen_ai.operation.name'] = '{operation_name}'"
            
            if endpoint:
                query += f" AND SpanAttributes['gen_ai.endpoint'] = '{endpoint}'"
            
            if is_stream:
                query += f" AND SpanAttributes['gen_ai.request.is_stream'] = '{is_stream}'"

            # Filter token usage
            if min_input_tokens:
                query += f" AND toInt32(SpanAttributes['gen_ai.usage.input_tokens']) >= {min_input_tokens}"
            if max_input_tokens:
                query += f" AND toInt32(SpanAttributes['gen_ai.usage.input_tokens']) <= {max_input_tokens}"
                
            if min_output_tokens:
                query += f" AND toInt32(SpanAttributes['gen_ai.usage.output_tokens']) >= {min_output_tokens}"
            if max_output_tokens:
                query += f" AND toInt32(SpanAttributes['gen_ai.usage.output_tokens']) <= {max_output_tokens}"
                
            if min_total_tokens:
                query += f" AND toInt32(SpanAttributes['gen_ai.usage.total_tokens']) >= {min_total_tokens}"
            if max_total_tokens:
                query += f" AND toInt32(SpanAttributes['gen_ai.usage.total_tokens']) <= {max_total_tokens}"
            
            # Filter duration
            if min_duration is not None:
                query += f" AND Duration >= {min_duration}"
            if max_duration is not None:
                query += f" AND Duration <= {max_duration}"
            
            query += """
            )
            SELECT *
            FROM filtered_data
            ORDER BY Timestamp DESC
            LIMIT 50
            """

            # Format tanggal untuk query
            query = query.format(start_date=start_date.strftime('%Y-%m-%d %H:%M:%S'))

            # Jalankan query
            traces = client.query(query).result_rows

            if not traces:
                return jsonify([])

            formatted_traces = []
            for row in traces:
                trace_data = {
                    "Timestamp": row[0].isoformat() if isinstance(row[0], datetime) else str(row[0]),
                    "TraceId": row[1] if len(row) > 1 else "",
                    "SpanId": row[2] if len(row) > 2 else "",
                    "ParentSpanId": row[3] if len(row) > 3 else "",
                    "TraceState": row[4] if len(row) > 4 else "",
                    "SpanName": row[5] if len(row) > 5 else "",
                    "SpanKind": row[6] if len(row) > 6 else "",
                    "ServiceName": row[7] if len(row) > 7 else "",
                    "ResourceAttributes": row[8] if len(row) > 8 and isinstance(row[8], dict) else {},
                    "ScopeName": row[9] if len(row) > 9 else "",
                    "ScopeVersion": row[10] if len(row) > 10 else "",
                    "SpanAttributes": row[11] if len(row) > 11 and isinstance(row[11], dict) else {},
                    "Duration": row[12] if len(row) > 12 else "",
                    "StatusCode": row[13] if len(row) > 13 else "STATUS_CODE_OK",
                    "StatusMessage": row[14] if len(row) > 14 else "",
                    "Events.Timestamp": [ts.isoformat() if isinstance(ts, datetime) else str(ts) for ts in (row[15] if len(row) > 15 and isinstance(row[15], list) else [])],
                    "Events.Name": row[16] if len(row) > 16 and isinstance(row[16], list) else [],
                    "Events.Attributes": row[17] if len(row) > 17 and isinstance(row[17], list) else [],
                    "Links.TraceId": [],
                    "Links.SpanId": [],
                    "Links.TraceState": [],
                    "Links.Attributes": []
                }
                formatted_traces.append(trace_data)

            return jsonify(formatted_traces)
            
        except Exception as e:
            print(f"Error dalam get: {str(e)}")  
            abort(500, f"Terjadi kesalahan server: {str(e)}")
