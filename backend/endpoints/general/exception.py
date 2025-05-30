from flask import jsonify, abort, request
from flask_restful import Resource
from datetime import datetime, timedelta, timezone
from data.configuration.databaseopenlit import client
import re

class Exception(Resource):
    def __init__(self):
        self.client = client

    def get(self):
        try:
            # Parsing query params
            params = request.args.to_dict(flat=False)
            from_date = request.args.get('from')
            to_date = request.args.get('to')
            
            # Param pagination
            page = int(request.args.get('page', 1))
            page_size = int(request.args.get('page_size', 10))
            
            sort_field = request.args.get('sort_field', 'Timestamp')
            sort_direction = request.args.get('sort_direction', 'desc').lower()
            
            # Validate pagination
            if page < 1:
                page = 1
            if page_size < 1 or page_size > 100:  # Limit page size 100
                page_size = 10
            
            # Mapping untuk sorting
            sort_field_mappings = {
                'Timestamp': 'Timestamp',
                'ServiceName': 'ServiceName',
                'SpanName': 'SpanName',
                'SpanAttributes.gen_ai.request.model': "SpanAttributes['gen_ai.request.model']",
                'SpanAttributes.gen_ai.operation.name': "SpanAttributes['gen_ai.operation.name']",
                'ResourceAttributes.service.name': "ResourceAttributes['service.name']"
            }

            # Validasi sorting
            if sort_field not in sort_field_mappings:
                sort_field = 'Timestamp'
            if sort_direction not in ['asc', 'desc']:
                sort_direction = 'desc'

            from_zone = timezone.utc
            to_zone = timezone(timedelta(hours=7))

            try:
                if from_date and to_date:
                    start_date = datetime.fromisoformat(from_date.replace('Z', '+00:00')).astimezone(to_zone)
                    end_date = datetime.fromisoformat(to_date.replace('Z', '+00:00')).astimezone(to_zone)
                else:
                    end_date = datetime.now(from_zone).astimezone(to_zone)
                    start_date = end_date - timedelta(days=1)
            except ValueError:
                return {"message": "Invalid date format. Use ISO 8601 format."}, 400

            start_date_str = start_date.strftime('%Y-%m-%d %H:%M:%S')
            end_date_str = end_date.strftime('%Y-%m-%d %H:%M:%S')

            #  Mapping filter
            filter_mappings = {
                'app_name': "ResourceAttributes['service.name']",
                'deployment_environment': "ResourceAttributes['deployment.environment']",
                'system': "SpanAttributes['gen_ai.system']",
                'model': "SpanAttributes['gen_ai.request.model']",
                'operation_name': "SpanAttributes['gen_ai.operation.name']",
                'endpoint': "SpanAttributes['gen_ai.endpoint']"
            }

            # Query total data
            count_query = f"""
            SELECT COUNT(*) as total
            FROM otel_traces
            WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            AND StatusCode = 'STATUS_CODE_ERROR'
            """

            params_query = {'start_date': start_date_str, 'end_date': end_date_str}

            for key, column in filter_mappings.items():
                snake_key = self.camel_to_snake(key)
                values = params.get(key) or params.get(snake_key)  # Support camelCase and snake_case

                if values:
                    placeholders = ', '.join([f"%({key}_{i})s" for i in range(len(values))])
                    count_query += f" AND {column} IN ({placeholders})"
                    for i, v in enumerate(values):
                        params_query[f"{key}_{i}"] = v

            # Execute count query
            count_result = self.client.query(count_query, params_query)
            total_count = count_result.result_rows[0][0] if count_result.result_rows else 0
            
            # Count total pages
            total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1

            # Query data
            query = f"""
            SELECT 
                ServiceName, Timestamp, TraceId, SpanId, ParentSpanId, TraceState, SpanName, SpanKind,
                ResourceAttributes, ScopeName, ScopeVersion, SpanAttributes, Duration, StatusCode,
                StatusMessage, Events.Timestamp, Events.Name, Events.Attributes
            FROM otel_traces
            WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            AND StatusCode = 'STATUS_CODE_ERROR'
            """

            for key, column in filter_mappings.items():
                snake_key = self.camel_to_snake(key)
                values = params.get(key) or params.get(snake_key)

                if values:
                    placeholders = ', '.join([f"%({key}_{i})s" for i in range(len(values))])
                    query += f" AND {column} IN ({placeholders})"
            if sort_field in sort_field_mappings:
                mapped_sort_field = sort_field_mappings[sort_field]
                sort_dir = "DESC" if sort_direction.lower() == "desc" else "ASC"
                
                if sort_field.startswith('SpanAttributes.') or sort_field.startswith('ResourceAttributes.'):
                    if "total_tokens" in sort_field or "cost" in sort_field:
                        query += f" ORDER BY ifNull(toFloat64OrZero(JSONExtractRaw({mapped_sort_field})), 0) {sort_dir}"
                    else:
                        query += f" ORDER BY {mapped_sort_field} {sort_dir}"
                else:
                    query += f" ORDER BY {mapped_sort_field} {sort_dir}"
            else:
                # Default sorting
                query += " ORDER BY Timestamp DESC"
            
            # Limit and offset pagination
            offset = (page - 1) * page_size
            query += f" LIMIT {page_size} OFFSET {offset}"

            result = self.client.query(query, params_query)
            traces = result.result_rows if hasattr(result, 'result_rows') else []

            if not traces:
                return jsonify({
                    "data": [],
                    "pagination": {
                        "total": total_count,
                        "page": page,
                        "pageSize": page_size,
                        "totalPages": total_pages
                    }
                })

            formatted_traces = [
                {
                    "ServiceName": row[0],
                    "Timestamp": row[1].astimezone(to_zone).isoformat() if row[1] else None,
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

            return jsonify({
                "data": formatted_traces,
                "pagination": {
                    "total": total_count,
                    "page": page,
                    "pageSize": page_size,
                    "totalPages": total_pages
                }
            })
            
        except Exception as e:
            abort(500, f"Internal server error: {str(e)}")

    @staticmethod
    def camel_to_snake(name):
        return re.sub(r'(?<!^)(?=[A-Z])', '_', name).lower()