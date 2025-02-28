from flask import jsonify, abort, request
from flask_restful import Resource
from datetime import datetime, timedelta, timezone
from data.configuration.databaseopenlit import client
import re

class Request(Resource):
    def __init__(self):
        self.client = client
    
    def get(self):
        try:
            params = request.args.to_dict()
            from_date = params.get('from')
            to_date = params.get('to')
            
            try:
                if from_date and to_date:
                    start_date = datetime.fromisoformat(from_date.replace('Z', '+00:00'))
                    end_date = datetime.fromisoformat(to_date.replace('Z', '+00:00'))
                else:
                    end_date = datetime.now(timezone.utc)
                    start_date = end_date - timedelta(days=7)
            except ValueError:
                return {"message": "Invalid date format. Use ISO 8601 format."}, 400
            
            start_date_str = start_date.strftime('%Y-%m-%d %H:%M:%S')
            end_date_str = end_date.strftime('%Y-%m-%d %H:%M:%S')
            
            filter_mappings = {
                'app_name': "ResourceAttributes['service.name']",
                'deployment_environment': "ResourceAttributes['deployment.environment']",
                'system': "SpanAttributes['gen_ai.system']",
                'model': "SpanAttributes['gen_ai.request.model']",
                'operation_name': "SpanAttributes['gen_ai.operation.name']",
                'endpoint': "SpanAttributes['gen_ai.endpoint']",
                'is_stream': "SpanAttributes['gen_ai.request.is_stream']",
                # 'minInputTokens': "toInt32OrZero(SpanAttributes['gen_ai.usage.input_tokens'])",
                # 'maxInputTokens': "toInt32OrZero(SpanAttributes['gen_ai.usage.input_tokens'])",
                # 'minOutputTokens': "toInt32OrZero(SpanAttributes['gen_ai.usage.output_tokens'])",
                # 'maxOutputTokens': "toInt32OrZero(SpanAttributes['gen_ai.usage.output_tokens'])",
                # 'minTotalTokens': "toInt32OrZero(SpanAttributes['gen_ai.usage.total_tokens'])",
                # 'maxTotalTokens': "toInt32OrZero(SpanAttributes['gen_ai.usage.total_tokens'])",
                'min_duration': 'Duration',
                'max_duration': 'Duration',
                'status_code': 'StatusCode'
            }
            
            query = f"""
            SELECT 
                ServiceName, Timestamp, TraceId, SpanId, ParentSpanId, TraceState, SpanName, SpanKind,
                ResourceAttributes, ScopeName, ScopeVersion, SpanAttributes, Duration, StatusCode,
                StatusMessage, Events.Timestamp, Events.Name, Events.Attributes
            FROM otel_traces
            WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            """
            
            params_query = {'start_date': start_date_str, 'end_date': end_date_str}
            
            for key, column in filter_mappings.items():
                snake_key = self.camel_to_snake(key)
                value = params.get(key) or params.get(snake_key)
                
                if key == 'status_code' and not value:
                    query += " AND StatusCode IN ('STATUS_CODE_OK', 'STATUS_CODE_UNSET')"
                elif value:
                    if key == 'status_code' and value not in ['STATUS_CODE_OK', 'STATUS_CODE_UNSET']:
                        abort(400, "Invalid status_code. Use 'STATUS_CODE_OK' or 'STATUS_CODE_UNSET'")
                    operator = '>=' if 'min' in key else '<=' if 'max' in key else '='
                    query += f" AND {column} {operator} %({key})s"
                    params_query[key] = value
            
            query += " ORDER BY Timestamp DESC LIMIT 50"
            
            result = self.client.query(query, params_query)
            traces = result.result_rows if hasattr(result, 'result_rows') else []
            
            if not traces:
                return jsonify([])
            
            formatted_traces = [
                {
                    "serviceName": row[0],
                    "Timestamp": row[1].isoformat() if row[1] else None,
                    "TraceId": row[2],
                    "SpanId": row[3],
                    "ParentSpanId": row[4],
                    "TraceState": row[5],
                    "SpanName": row[6],
                    "SpanKind": row[7],
                    "ResourceAttributes": row[8] if isinstance(row[8], dict) else {},
                    "ScopeName": row[9],
                    "ScopeVersion": row[10],
                    "SpanAttributes": row[11] if isinstance(row[11], dict) else {},
                    "Duration": str(row[12]) if row[12] else "0",
                    "StatusCode": row[13],
                    "StatusMessage": row[14],
                    "Events": {
                        "Timestamp": row[15] if isinstance(row[15], list) else [],
                        "Name": row[16] if isinstance(row[16], list) else [],
                        "Attributes": row[17] if isinstance(row[17], list) else []
                    }
                }
                for row in traces
            ]
            
            return jsonify(formatted_traces)
        except Exception as e:
            abort(500, f"Internal server error: {str(e)}")
    
    @staticmethod
    def camel_to_snake(name):
        return re.sub(r'(?<!^)(?=[A-Z])', '_', name).lower()