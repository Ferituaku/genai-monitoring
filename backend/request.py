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

# Updated resource fields
trace_fields = {
    'Timestamp': fields.String,
    'TraceId': fields.String,
    'SpanId': fields.String,
    'ParentSpanId': fields.String,
    'TraceState': fields.String,
    'SpanName': fields.String,
    'SpanKind': fields.String,
    'ServiceName': fields.String,
    'ResourceAttributes': fields.Raw,
    'ScopeName': fields.String,
    'ScopeVersion': fields.String,
    'SpanAttributes': fields.Raw,
    'Duration': fields.String,
    'StatusCode': fields.String,
    'StatusMessage': fields.String,
    'Events.Timestamp': fields.List(fields.String),
    'Events.Name': fields.List(fields.String),
    'Events.Attributes': fields.List(fields.Raw),
    'Links.TraceId': fields.List(fields.String),
    'Links.SpanId': fields.List(fields.String),
    'Links.TraceState': fields.List(fields.String),
    'Links.Attributes': fields.List(fields.Raw)
}

class Traces(Resource):
    @marshal_with(trace_fields)
    def get(self, appName=None):
        try:
            if appName:
                query = f"SELECT * FROM otel_traces WHERE ServiceName = '{appName}' AND StatusCode IN ('STATUS_CODE_OK', 'STATUS_CODE_UNSET') ORDER BY Timestamp DESC"
            else:
                query = "SELECT * FROM otel_traces WHERE StatusCode IN ('STATUS_CODE_OK', 'STATUS_CODE_UNSET') ORDER BY Timestamp DESC"
                
            traces = client.query(query).result_rows
            return self.format_traces(traces)
        except Exception as e:
            abort(500, f"Internal Server Error: {str(e)}")

    @staticmethod
    def calculate_duration(timestamps):
        """Calculate duration in nanoseconds from timestamps"""
        if not isinstance(timestamps, list) or len(timestamps) < 2:
            return "0"
            
        try:
            start_time = timestamps[0]
            end_time = timestamps[1]
            
            if not (isinstance(start_time, datetime) and isinstance(end_time, datetime)):
                return "0"
                
            # Calculate duration in nanoseconds
            duration_td = end_time - start_time
            duration_ns = int(duration_td.total_seconds() * 1_000_000_000)
            return str(duration_ns)
        except Exception as e:
            print(f"Error calculating duration: {e}")
            return "0"

    @staticmethod
    def format_traces(traces):
        formatted_data = []
        for row in traces:
            try:
                # Extract data from row
                timestamp = row[0]
                trace_id = row[1]
                span_id = row[2]
                parent_span_id = row[3]
                trace_state = row[4]
                span_name = row[5]
                span_kind = row[6]
                service_name = row[7]
                resource_attributes = row[8] if isinstance(row[8], dict) else {}
                scope_name = row[9] if len(row) > 9 else ""
                scope_version = row[10] if len(row) > 10 else ""
                span_attributes = row[11] if isinstance(row[11], dict) else {}
                status_code = row[12] if len(row) > 12 else "STATUS_CODE_OK"
                
                # Extract duration data
                duration_timestamps = row[13] if isinstance(row[13], list) else []
                duration = Traces.calculate_duration(duration_timestamps)
                
                # Extract events data
                content_types = row[14] if len(row) > 14 and isinstance(row[14], list) else []
                content_values = row[15] if len(row) > 15 and isinstance(row[15], list) else []
                
                # Format events
                events_timestamps = []
                events_names = []
                events_attributes = []
                
                for i, content_type in enumerate(content_types):
                    if i < len(content_values):
                        events_timestamps.append(timestamp.isoformat())
                        events_names.append(content_type)
                        if content_type == 'gen_ai.content.prompt':
                            events_attributes.append({
                                "gen_ai.prompt": content_values[i].get('gen_ai.prompt', '')
                            })
                        elif content_type == 'gen_ai.content.completion':
                            events_attributes.append({
                                "gen_ai.completion": content_values[i].get('gen_ai.completion', '')
                            })

                # Format the trace data
                trace_data = {
                    "Timestamp": timestamp.isoformat() if timestamp else "",
                    "TraceId": trace_id or "",
                    "SpanId": span_id or "",
                    "ParentSpanId": parent_span_id or "",
                    "TraceState": trace_state or "",
                    "SpanName": span_name or "",
                    "SpanKind": span_kind or "",
                    "ServiceName": service_name or "",
                    "ResourceAttributes": resource_attributes,
                    "ScopeName": scope_name,
                    "ScopeVersion": scope_version,
                    "SpanAttributes": span_attributes,
                    "Duration": duration,
                    "StatusCode": status_code,
                    "StatusMessage": "",
                    "Events.Timestamp": events_timestamps,
                    "Events.Name": events_names,
                    "Events.Attributes": events_attributes,
                    "Links.TraceId": [],
                    "Links.SpanId": [],
                    "Links.TraceState": [],
                    "Links.Attributes": []
                }

                formatted_data.append(trace_data)
            except Exception as e:
                print(f"Error formatting row: {e}")
                continue
                
        return formatted_data

api.add_resource(Traces, '/api/traces/', '/api/traces/<string:appName>')

if __name__ == '__main__':
    app.run(debug=True)