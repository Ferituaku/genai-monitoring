from flask import jsonify, abort, request
from flask_restful import Api, Resource
from datetime import datetime, timedelta, timezone
from data.configuration.databaseopenlit import client
import numpy as np

class Request(Resource):
    def __init__(self):
        self.client = client

    def get(self):
        try:
            from_date = request.args.get('from')
            to_date = request.args.get('to')

            if from_date and to_date:
                try:
                    start_date = datetime.fromisoformat(from_date.replace('Z', '+00:00'))
                    end_date = datetime.fromisoformat(to_date.replace('Z', '+00:00'))
                except ValueError:
                    abort(400, "Invalid date format. Use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)")
            else:
                end_date = datetime.now(timezone.utc)
                start_date = end_date - timedelta(days=7)

            start_date_str = start_date.strftime('%Y-%m-%d %H:%M:%S')
            end_date_str = end_date.strftime('%Y-%m-%d %H:%M:%S')

            filters = {
                'status_code': {
                    'column': 'StatusCode',
                    'type': str,
                    'operator': 'IN',
                    'default': ['STATUS_CODE_OK', 'STATUS_CODE_UNSET']
                },
                'deployment_environment': {
                    'column': "ResourceAttributes['deployment.environment']",
                    'type': str,
                    'operator': '='
                },
                'model': {
                    'column': "SpanAttributes['gen_ai.request.model']",
                    'type': str,
                    'operator': '='
                },
                'min_input_tokens': {
                    'column': "toInt32(SpanAttributes['gen_ai.usage.input_tokens'])",
                    'type': int,
                    'operator': '>='
                },
                'max_input_tokens': {
                    'column': "toInt32(SpanAttributes['gen_ai.usage.input_tokens'])",
                    'type': int,
                    'operator': '<='
                },
                'min_output_tokens': {
                    'column': "toInt32(SpanAttributes['gen_ai.usage.output_tokens'])",
                    'type': int,
                    'operator': '>='
                },
                'max_output_tokens': {
                    'column': "toInt32(SpanAttributes['gen_ai.usage.output_tokens'])",
                    'type': int,
                    'operator': '<='
                },
                'min_total_tokens': {
                    'column': "toInt32(SpanAttributes['gen_ai.usage.total_tokens'])",
                    'type': int,
                    'operator': '>='
                },
                'max_total_tokens': {
                    'column': "toInt32(SpanAttributes['gen_ai.usage.total_tokens'])",
                    'type': int,
                    'operator': '<='
                },
                'min_duration': {
                    'column': 'Duration',
                    'type': float,
                    'operator': '>='
                },
                'max_duration': {
                    'column': 'Duration',
                    'type': float,
                    'operator': '<='
                }
            }

            # Start query
            query = """
            WITH filtered_data AS (
                SELECT 
                    ServiceName,
                    Timestamp,
                    TraceId,
                    SpanId,
                    ParentSpanId,
                    TraceState,
                    SpanName,
                    SpanKind,
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
                WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
                AND StatusCode IN ('STATUS_CODE_OK', 'STATUS_CODE_UNSET')
            """
            
            params = {
                'start_date': start_date_str,
                'end_date': end_date_str
            }

            # Params app_name
            app_name = request.args.get('app_name')
            if app_name:
                query += " AND ServiceName = %(app_name)s"
                params['app_name'] = app_name

            # Params filter
            for param_name, filter_config in filters.items():
                value = request.args.get(param_name, type=filter_config['type'])
                # Filter status code
                if param_name == 'status_code':
                    status_values = filter_config['default']
                    if value:
                        status_values = [value]
                    query += f" AND {filter_config['column']} IN %(status_values)s"
                    params['status_values'] = tuple(status_values)
                # Another filter 
                elif value is not None:
                    query += f" AND {filter_config['column']} {filter_config['operator']} %({param_name})s"
                    params[param_name] = value

            # Close query
            query += """
            )
            SELECT *
            FROM filtered_data
            ORDER BY Timestamp DESC
            LIMIT 50
            """

            traces = self.client.query(query, params).result_rows

            if not traces:
                return jsonify([])

            # Format traces
            formatted_traces = []
            for row in traces:
                trace_data = {
                    "ServiceName": row[0],
                    "Timestamp": row[1].isoformat() if isinstance(row[1], datetime) else str(row[1]),
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
                    "Duration": row[12],
                    "StatusCode": row[13],
                    "StatusMessage": row[14],
                    "Events": {
                        "Timestamp": row[15] if isinstance(row[15], list) else [],
                        "Name": row[16] if isinstance(row[16], list) else [],
                        "Attributes": row[17] if isinstance(row[17], list) else []
                    }
                }
                formatted_traces.append(trace_data)

            return jsonify(formatted_traces)

        except Exception as e:
            print(f"Error in get: {str(e)}")
            abort(500, f"Terjadi kesalahan server: {str(e)}")