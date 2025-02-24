from flask import jsonify, abort, request
from flask_restful import Resource
from datetime import datetime, timedelta, timezone
from data.configuration.databaseopenlit import client

class Request(Resource):
    def __init__(self):
        self.client = client

    def get(self):
        try:
            # Parsing query params (camelCase & snake_case support)
            params = request.args.to_dict()
            
            # Date Range Filtering
            from_date = params.get('from') 
            # or params.get('fromDate') or params.get('from_date')
            to_date = params.get('to') 
            # or params.get('toDate') or params.get('to_date')

            # if from_date and to_date:
            #     try:
            #         start_date = datetime.fromisoformat(from_date.replace('Z', '+00:00'))
            #         end_date = datetime.fromisoformat(to_date.replace('Z', '+00:00'))
            #     except ValueError:
            #         abort(400, "Invalid date format. Use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)")
            # else:
            #     end_date = datetime.now(timezone.utc)
            #     start_date = end_date - timedelta(days=7)

            try:
                if from_date and to_date:
                    start_date = datetime.fromisoformat(from_date.replace('Z', '+00:00'))
                    end_date = datetime.fromisoformat(to_date.replace('Z', '+00:00'))
                else:
                    # Default to last 7 days if no dates provided
                    end_date = datetime.now(timezone.utc)
                    start_date = end_date - timedelta(days=7)
                


                # Format datetime for query
                start_date_str = start_date.strftime('%Y-%m-%d %H:%M:%S')
                end_date_str = end_date.strftime('%Y-%m-%d %H:%M:%S')

                # Allowed filters and sorting columns
                filter_mappings = {
                    'appName': "ResourceAttributes['service.name']",
                    'deploymentEnvironment': "ResourceAttributes['deployment.environment']",
                    'system': "SpanAttributes['gen_ai.system']",
                    'model': "SpanAttributes['gen_ai.request.model']",
                    'operationName': "SpanAttributes['gen_ai.operation.name']",
                    'endpoint': "SpanAttributes['gen_ai.endpoint']",
                    'isStream': "SpanAttributes['gen_ai.request.is_stream']",
                    'minInputTokens': "toInt32(SpanAttributes['gen_ai.usage.input_tokens'])",
                    'maxInputTokens': "toInt32(SpanAttributes['gen_ai.usage.input_tokens'])",
                    'minOutputTokens': "toInt32(SpanAttributes['gen_ai.usage.output_tokens'])",
                    'maxOutputTokens': "toInt32(SpanAttributes['gen_ai.usage.output_tokens'])",
                    'minTotalTokens': "toInt32(SpanAttributes['gen_ai.usage.total_tokens'])",
                    'maxTotalTokens': "toInt32(SpanAttributes['gen_ai.usage.total_tokens'])",
                    'minDuration': 'Duration',
                    'maxDuration': 'Duration',
                    'statusCode': 'StatusCode'
                }

                # Build SQL Query
                query = f"""
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
                """

                params_query = {
                    'start_date': start_date_str,
                    'end_date': end_date_str
                }

                # Apply Filters
                for key, column in filter_mappings.items():
                    camel_key = key
                    snake_key = key.replace('CamelCase', '_').lower()

                    value = params.get(camel_key) or params.get(snake_key)
                    
                    # Handle status code default
                    if key == 'statusCode' and not value:
                        query += " AND StatusCode IN ('STATUS_CODE_OK', 'STATUS_CODE_UNSET')"
                    elif value:
                        if key == 'statusCode' and value not in ['STATUS_CODE_OK', 'STATUS_CODE_UNSET']:
                            abort(400, "Invalid statusCode. Use 'STATUS_CODE_OK' or 'STATUS_CODE_UNSET'")
                        operator = '>=' if 'min' in key else '<=' if 'max' in key else '='
                        query += f" AND {column} {operator} %({key})s"
                        params_query[key] = value

                query += " ORDER BY Timestamp DESC LIMIT 50"

                # Execute query
                traces = self.client.query(query, params_query).result_rows

                if not traces:
                    return jsonify([])

                # Format Response
                formatted_traces = []
                for row in traces:
                    trace_data = {
                        "serviceName": row[0],
                        "timestamp": row[1].isoformat() if isinstance(row[1], datetime) else str(row[1]),
                        "traceId": row[2],
                        "spanId": row[3],
                        "parentSpanId": row[4],
                        "traceState": row[5],
                        "spanName": row[6],
                        "spanKind": row[7],
                        "resourceAttributes": row[8] if isinstance(row[8], dict) else {},
                        "scopeName": row[9],
                        "scopeVersion": row[10],
                        "spanAttributes": row[11] if isinstance(row[11], dict) else {},
                        "duration": row[12],
                        "statusCode": row[13],
                        "statusMessage": row[14],
                        "events": {
                            "timestamp": row[15] if isinstance(row[15], list) else [],
                            "name": row[16] if isinstance(row[16], list) else [],
                            "attributes": row[17] if isinstance(row[17], list) else []
                        }
                    }
                    formatted_traces.append(trace_data)

                return jsonify(formatted_traces)
            except ValueError as e:
                print(f"Date parsing error: {e}")
                return {"message": f"Invalid date format: {str(e)}"}, 400
                
        except Exception as e:
            print(f"Error in get: {str(e)}")
            abort(500, f"Terjadi kesalahan server: {str(e)}")