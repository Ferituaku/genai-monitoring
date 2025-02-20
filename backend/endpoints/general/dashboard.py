from flask import jsonify, request, abort
from flask_restful import Resource
from datetime import datetime, timedelta,timezone
from data.configuration.databaseopenlit import client


class Dashboard(Resource):

    def __init__(self):
        self.client = client  
        # self.days = request.args.get('days', default=7, type=int)

    def get(self):
        try:
            # Parsing query params (camelCase & snake_case support)
            params = request.args.to_dict()
            
            # Date Range Filtering
            from_date = params.get('from') or params.get('fromDate') or params.get('from_date')
            to_date = params.get('to') or params.get('toDate') or params.get('to_date')

            if from_date and to_date:
                try:
                    start_date = datetime.fromisoformat(from_date.replace('Z', '+00:00'))
                    end_date = datetime.fromisoformat(to_date.replace('Z', '+00:00'))
                except ValueError:
                    abort(400, "Invalid date format. Use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)")
            else:
                end_date = datetime.now(timezone.utc)
                start_date = end_date - timedelta(days=7)

            # Format datetime for query
            start_date_str = start_date.strftime('%Y-%m-%d %H:%M:%S')
            end_date_str = end_date.strftime('%Y-%m-%d %H:%M:%S')

            query_params = {
                'start_date': start_date_str,
                'end_date': end_date_str
            }

            # total request yg ga pake sttatus error
            total_request_query = """
                SELECT COUNT(
                    CASE 
                        WHEN StatusCode IN ('STATUS_CODE_OK','STATUS_CODE_UNSET') THEN 1 
                        ELSE NULL 
                    END
                ) AS total_requests 
                FROM otel_traces
                WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            """
            
            total_requests_result = client.query(total_request_query,query_params).result_rows[0][0]
            
            # total request lengkap
            total_request_all_query = """
                SELECT COUNT(
                    CASE 
                        WHEN StatusCode IN ('STATUS_CODE_OK','STATUS_CODE_UNSET','STATUS_CODE_ERROR') THEN 1 
                        ELSE NULL 
                    END
                ) AS total_requests 
                FROM otel_traces
                WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            """
            
            total_request_all_result = client.query(total_request_all_query,query_params).result_rows[0][0]

            #total request yg ok
            total_requests_ok_query = """
            SELECT COUNT(
                CASE 
                    WHEN StatusCode IN ('STATUS_CODE_OK') THEN 1
                    ELSE NULL
                END
            ) AS total_requests_ok
            FROM otel_traces
            WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
             """

            total_requests_ok_result = client.query(total_requests_ok_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows[0][0]

            # total cost
            total_cost_query = """
            SELECT SUM(
                CASE 
                    WHEN StatusCode IN ('STATUS_CODE_OK') THEN toFloat64OrZero(SpanAttributes['gen_ai.usage.cost'])
                    ELSE 0
                END
            ) AS total_cost
            FROM otel_traces
            WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            """
            total_cost_result = client.query(total_cost_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows[0][0]

            #total tokens
            total_tokens_query =  """
                SELECT SUM(
                    CASE
                        WHEN StatusCode IN ('STATUS_CODE_OK') THEN toFloat64OrZero(SpanAttributes['gen_ai.usage.total_tokens']) 
                        ELSE 0
                    END
                ) AS total_tokens
                FROM otel_traces
                WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            """

            total_tokens_result = client.query(total_tokens_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows[0][0]
                        
             
            # avg duration bisa langsung dia
            avg_duration_query = """
                SELECT 
                Round((AVG(
                    Duration
                )/1000000000),5) AS avg_duration
                FROM otel_traces
                WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            """
            
            avg_duration = client.query(avg_duration_query,query_params).result_rows[0][0]
             
            # total cost tapi ini di group sesuai dengan service name nya
            total_cost_perapp_query = """
            SELECT
                ServiceName,
                SUM(
                    CASE
                        WHEN StatusCode IN ('STATUS_CODE_OK') 
                        THEN toFloat64OrZero(SpanAttributes['gen_ai.usage.cost'])
                        ELSE 0
                    END
                ) AS totalcostperservicename
            FROM otel_traces
            WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            GROUP BY ServiceName

            """
            total_cost_perapp_result = client.query(total_cost_perapp_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows

            if not total_cost_perapp_result:
                return jsonify({"error": "No data found"})

            total_cost_perapp = {row[0]: float(row[1]) for row in total_cost_perapp_result}

            
            total_gen_by_category_query = """
            SELECT 
                SpanAttributes['gen_ai.operation.name'] AS operation_name,
                COUNT(*) AS total_count
            FROM otel_traces
            WHERE 
                SpanAttributes['gen_ai.operation.name'] IS NOT NULL 
                AND SpanAttributes['gen_ai.operation.name'] <> '' 
                AND Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            GROUP BY SpanAttributes['gen_ai.operation.name']
            """
            total_gen_by_category_result = client.query(total_gen_by_category_query, query_params).result_rows

            cost_data_gen = {}
            if total_gen_by_category_result and all(len(row) >= 2 for row in total_gen_by_category_result):
                cost_data_gen = {row[0]: float(row[1]) for row in total_gen_by_category_result if row[0]}

            total_env_query = """
            SELECT 
                ResourceAttributes['deployment.environment']  AS env,
                COUNT(*) AS total_count
            FROM otel_traces
            WHERE 
                ResourceAttributes['deployment.environment']  IS NOT NULL 
                AND ResourceAttributes['deployment.environment']  <> '' 
                AND Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            GROUP BY ResourceAttributes['deployment.environment']
            """
            total_env_result = client.query(total_env_query, query_params).result_rows

            cost_data_env = {}
            if total_env_result and all(len(row) >= 2 for row in total_env_result):
                cost_data_env = {row[0]: float(row[1]) for row in total_env_result if row[0]}

            total_top_model_query = """
            SELECT 
                SpanAttributes['gen_ai.request.model'] AS operation_name,
                COUNT(*) AS total_count
            FROM otel_traces
            WHERE 
                SpanAttributes['gen_ai.request.model'] IS NOT NULL 
                AND SpanAttributes['gen_ai.request.model'] <> '' 
                AND Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            GROUP BY SpanAttributes['gen_ai.request.model']
            """
            total_top_model_result = client.query(total_top_model_query, query_params).result_rows

            cost_data_model = {}
            if total_top_model_result and all(len(row) >= 2 for row in total_top_model_result):
                cost_data_model = {row[0]: float(row[1]) for row in total_top_model_result if row[0]}


            #total prompt biasa
            total_prompt_query =  """
                SELECT SUM(
                    CASE
                        WHEN StatusCode IN ('STATUS_CODE_OK') THEN toFloat64OrZero(SpanAttributes['gen_ai.usage.input_tokens']) 
                        ELSE 0
                    END
                ) AS total_tokens
                FROM otel_traces
                WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            """

            total_prompt_result = client.query(total_prompt_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows[0][0]

            #total completion biasa
            total_completion_query =  """
                SELECT SUM(
                    CASE
                        WHEN StatusCode IN ('STATUS_CODE_OK') THEN toFloat64OrZero(SpanAttributes['gen_ai.usage.output_tokens']) 
                        ELSE 0
                    END
                ) AS total_tokens
                FROM otel_traces
                WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            """

            total_completion_result = client.query(total_completion_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows[0][0]
            
            # Query untuk total prompt tokens tapi di grup by tanggal 
            total_prompt_tanggal_query = """
            SELECT 
                toDate(Timestamp) AS date,
                SUM(
                    CASE 
                        WHEN StatusCode = 'STATUS_CODE_OK' THEN toFloat64OrZero(SpanAttributes['gen_ai.usage.input_tokens']) 
                        ELSE 0
                    END
                ) AS total_prompt_tokens
            FROM otel_traces
            WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            GROUP BY date
            ORDER BY date ASC
            """
            total_prompt_tanggal_result = client.query(total_prompt_tanggal_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows

            # Query untuk total completion tokens tapi di grup by tanggal 
            total_completion_tanggal_query = """
            SELECT 
                toDate(Timestamp) AS date,
                SUM(
                    CASE 
                        WHEN StatusCode = 'STATUS_CODE_OK' THEN toFloat64OrZero(SpanAttributes['gen_ai.usage.output_tokens']) 
                        ELSE 0
                    END
                ) AS total_completion_tokens
            FROM otel_traces
            WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            GROUP BY date
            ORDER BY date ASC
            """
            total_completion_tanggal_result = client.query(total_completion_tanggal_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows


            #status ok yg pake tanggal
            total_status_ok_query = """
            SELECT 
                toDate(Timestamp) AS date,
                SUM(CASE WHEN StatusCode = 'STATUS_CODE_OK' THEN 1 ELSE 0 END) AS total_status_ok
            FROM otel_traces
            WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            GROUP BY date
            """

            total_status_ok_result = client.query(total_status_ok_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows
            
            #status unset yg pake tanggal
            total_status_unset_query = """
            SELECT 
                toDate(Timestamp) AS date,
                SUM(CASE WHEN StatusCode = 'STATUS_CODE_UNSET' THEN 1 ELSE 0 END) AS total_status_unset
            FROM otel_traces
            WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            GROUP BY date
            """

            total_status_unset_result = client.query(total_status_unset_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows

            #status error yg pake tanggal
            total_status_error_query = """
            SELECT 
                toDate(Timestamp) AS date,
                SUM(CASE WHEN StatusCode = 'STATUS_CODE_ERROR' THEN 1 ELSE 0 END) AS total_status_error
            FROM otel_traces
            WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            GROUP BY date
            """

            total_status_error_result = client.query(total_status_error_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows
        
            #itung2nya nya
            avg_token = round(total_tokens_result/total_requests_ok_result,5)
            avg_cost = round(total_cost_result/total_requests_ok_result,8)
            avg_prompt_tokens = round(total_prompt_result/total_requests_ok_result,8)
            avg_completion_tokens = round(total_completion_result/total_requests_ok_result,8)
            

            # piechart
            cost_by_app = {
            service: [service.capitalize(), f"{(total_cost_perapp_item / total_cost_result) * 100:.2f}%"]
            for service, total_cost_perapp_item in total_cost_perapp.items()
            }

            gen_by_category = {
                service: [
                    service.capitalize(), 
                    f"{(total_gen_cost / total_requests_ok_result) * 100:.2f}%" if total_requests_ok_result > 0 else "0.00%"
                ]
                for service, total_gen_cost in cost_data_gen.items() if service
            }

            cost_by_env = {
                service: [
                    service.capitalize(), 
                    f"{(total_env_cost / total_request_all_result) * 100:.2f}%" if total_request_all_result > 0 else "0.00%"
                ]
                for service, total_env_cost in cost_data_env.items() if service
            }

            top_model = {
                service: [ 
                    f"{(total_model / total_requests_ok_result) * 100:.2f}%" if total_requests_ok_result > 0 else "0.00%"
                ]
                for service, total_model in cost_data_model.items() if service
            }


            #grafik
            token_usage_data = {}
            for row in total_prompt_tanggal_result:
                date = row[0].strftime("%d-%m-%Y")
                token_usage_data[date] = [f"total prompt : {int(row[1])}"]
            for row in total_completion_tanggal_result:
                date = row[0].strftime("%d-%m-%Y")
                if date in token_usage_data:
                    token_usage_data[date].append(f"total completion : {int(row[1])}")
                else:
                    token_usage_data[date] = [f"total completion : {int(row[1])}"]

            request_pertime_data = {}
            for row in total_status_ok_result:
                date = row[0].strftime("%d-%m-%Y")
                request_pertime_data[date] = [f"total_status_ok: {int(row[1])}"]
            for row in total_status_unset_result:
                date = row[0].strftime("%d-%m-%Y")
                if date in request_pertime_data:
                    request_pertime_data[date].append(f"total_status_unset: {int(row[1])}")
                else:
                    request_pertime_data[date] = [f"total_status_unset: {int(row[1])}"]
            for row in total_status_error_result:
                date = row[0].strftime("%d-%m-%Y")
                if date in request_pertime_data:
                    request_pertime_data[date].append(f"total_status_error: {int(row[1])}")
                else:
                    request_pertime_data[date] = [f"total_status_error: {int(row[1])}"]



            return jsonify({         
                "total_requests": total_requests_result,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "avg_token": avg_token,
                "avg_cost": avg_cost,
                "avg_duration": avg_duration,
                "cost_by_app" : cost_by_app,
                "gen_by_category" : gen_by_category,
                "cost_by_env" : cost_by_env,
                "token_usage": token_usage_data,
                "avg_prompt_tokens" : avg_prompt_tokens,
                "avg_completion_tokens" : avg_completion_tokens,
                "top_model" : top_model,
                "request_pertime": request_pertime_data,
            })

        except Exception as e:
            abort(500, f"Internal Server Error: {str(e)}")

