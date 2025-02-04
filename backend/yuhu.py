import clickhouse_connect
from flask import Flask, jsonify, request, abort
from flask_restful import Api, Resource
from datetime import datetime, timedelta
from flask_cors import CORS

app = Flask(__name__)
api = Api(app)
CORS(app)

# Fungsi untuk membuat client baru (hindari masalah concurrency)
def get_client():
    return clickhouse_connect.get_client(
        host='openlit.my.id',
        port=8123,
        database='openlit',
        username='default',
        password='OPENLIT',
        secure=False  # Menghindari session locking
    )

class Angka(Resource):
    def get(self):
        try:
            # Ambil nilai 'days' dari parameter request (default: 7 hari)
            days = request.args.get('days', default=7, type=int)
            start_date = datetime.utcnow() - timedelta(days=days)
            end_date = datetime.utcnow()

            start_date_str = start_date.strftime('%Y-%m-%d %H:%M:%S')
            end_date_str = end_date.strftime('%Y-%m-%d %H:%M:%S')

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
            client = get_client()
            total_requests = client.query(total_request_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows[0][0]
            client.close() 
            
            
            # Query untuk rata2 token
            avg_token_query =  """
                WITH request_counts_ok AS (
                    SELECT COUNT(
                        CASE 
                            WHEN StatusCode IN ('STATUS_CODE_OK') THEN 1
                            ELSE NULL
                        END
                    ) AS total_requests_ok
                    FROM otel_traces
                    WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
                ),
                token_counts AS (
                    SELECT SUM(
                        CASE 
                            WHEN StatusCode IN ('STATUS_CODE_OK') THEN CAST(SpanAttributes['gen_ai.usage.total_tokens'] AS Float64)
                            ELSE 0
                        END
                    ) AS total_tokens
                    FROM otel_traces
                    WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
                )
                SELECT total_requests_ok, total_tokens, Round((total_tokens/total_requests_ok),5)  AS avg_token
                FROM request_counts_ok, token_counts
            """
            client = get_client()
            avg_token = client.query(avg_token_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows[0][2]
            client.close() 

            # Query untuk rata2 cost
            avg_cost_query =  """
                WITH request_counts_ok AS (
                    SELECT COUNT(
                        CASE 
                            WHEN StatusCode IN ('STATUS_CODE_OK') THEN 1
                            ELSE NULL
                        END
                    ) AS total_requests_ok
                    FROM otel_traces
                    WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
                ),
                cost_counts AS (
                    SELECT SUM(
                        CASE 
                            WHEN StatusCode IN ('STATUS_CODE_OK') THEN CAST(SpanAttributes['gen_ai.usage.cost'] AS Float64)
                            ELSE 0
                        END
                    ) AS total_cost
                    FROM otel_traces
                    WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
                )
                SELECT total_requests_ok, total_cost, Round((total_cost/total_requests_ok),8)  AS avg_cost
                FROM request_counts_ok, cost_counts
            """
            client = get_client()
            avg_cost = client.query(avg_cost_query,  {'start_date': start_date_str, 'end_date': end_date_str}).result_rows[0][2]
            client.close() 

            avg_duration_query = """
                SELECT 
                Round((AVG(
                    Duration
                )/1000000000),5) AS avg_duration
                FROM otel_traces
                WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            """
            client = get_client()
            avg_duration = client.query(avg_duration_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows[0][0]
            client.close() 

            Cost_by_app_query = """
                WITH cost_data AS (
                    SELECT 
                        ServiceName, 
                        SUM(
                            CASE 
                                WHEN StatusCode IN ('STATUS_CODE_OK') THEN CAST(SpanAttributes['gen_ai.usage.cost'] AS Float64)
                                ELSE 0
                            END
                        ) AS totalcostperservicename
                    FROM otel_traces
                    WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
                    GROUP BY ServiceName
                    
                ),
                total_cost AS (
                    SELECT SUM(totalcostperservicename) AS overall_cost FROM cost_data

                )
                SELECT 
                    c.ServiceName, 
                    c.totalcostperservicename, 
                    (c.totalcostperservicename / t.overall_cost) * 100 AS percentage
                FROM cost_data c, total_cost t
                ORDER BY c.totalcostperservicename DESC
                LIMIT 5
            """
            client = get_client()
            Cost_by_app_result = client.query(Cost_by_app_query,{'start_date': start_date_str, 'end_date': end_date_str}).result_rows
            client.close() 

            if not Cost_by_app_result:
                return jsonify({"error": "No data found"}), 500

            # Membuat dictionary dengan format yang diminta
            Cost_by_app = {
                f"app{i+1}": [row[0], f"{row[2]:.2f}%"] for i, row in enumerate(Cost_by_app_result[:5])
            }

            Gen_by_category_query =  """
            WITH cost_data AS (
                SELECT 
                    SpanAttributes['gen_ai.operation.name'] AS operation_name,
                    COUNT(*) AS total_count
                FROM otel_traces
                WHERE SpanAttributes['gen_ai.operation.name'] IS NOT NULL 
                    AND SpanAttributes['gen_ai.operation.name'] <> ''
                    AND Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
                GROUP BY SpanAttributes['gen_ai.operation.name']
            ),
            total_cost AS (
                SELECT SUM(total_count) AS overall FROM cost_data
            )
            SELECT 
                operation_name AS category,
                (total_count / NULLIF(t.overall, 0)) * 100 AS percentage
            FROM cost_data c, total_cost t
            ORDER BY percentage DESC
            """
            client = get_client()
            Gen_by_category_result = client.query(Gen_by_category_query,{'start_date': start_date_str, 'end_date': end_date_str}).result_rows
            client.close() 

            if not Gen_by_category_result:
                return jsonify({"error": "No data found"})
            else:
                # Membuat dictionary JSON
                Gen_by_category = {
                    "Gen by category" : {
                    row[0]: [row[0].capitalize(), f"{float(row[1]):.2f}%"]
                    for row in Gen_by_category_result
                    }
                }
            
            Cost_by_env_query =  """
            WITH cost_data AS (
                SELECT 
                   ResourceAttributes['deployment.environment'] AS operation_name,
                    COUNT(*) AS total_count
                FROM otel_traces
                WHERE ResourceAttributes['deployment.environment'] IS NOT NULL 
                    AND ResourceAttributes['deployment.environment'] <> ''
                    AND Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
                GROUP BY ResourceAttributes['deployment.environment']
              
            ),
            total_cost AS (
                SELECT SUM(total_count) AS overall FROM cost_data
            )
            SELECT 
                operation_name AS category,
                (total_count / NULLIF(t.overall, 0)) * 100 AS percentage
            FROM cost_data c, total_cost t
            ORDER BY percentage DESC
            
            
            """
            client = get_client()
            Cost_by_env_result = client.query(Cost_by_env_query,{'start_date': start_date_str, 'end_date': end_date_str}).result_rows
            client.close() 

            if not Cost_by_env_result:
                return jsonify({"error": "No data found"})
            else:
                # Membuat dictionary JSON
                Cost_by_env = {
                    "cost by env" : {
                    row[0]: [row[0].capitalize(), f"{float(row[1]):.2f}%"]
                    for row in Cost_by_env_result
                }
            }

            token_usege_query = """
            SELECT 
                toDate(Timestamp) AS date,
                SUM(
                    CASE 
                    WHEN StatusCode IN ('STATUS_CODE_OK') 
                    THEN toFloat64OrZero(SpanAttributes['gen_ai.usage.input_tokens']) 
                    ELSE 0
                    END
                ) AS total_prompt_tokens,
                SUM(
                    CASE 
                    WHEN StatusCode IN ('STATUS_CODE_OK') 
                    THEN toFloat64OrZero(SpanAttributes['gen_ai.usage.output_tokens']) 
                    ELSE 0
                    END
                ) AS total_completion_tokens
            FROM otel_traces
            WHERE Timestamp BETWEEN %(start_date)s AND %(end_date)s
            GROUP BY date
            ORDER BY date
            """

            client = get_client()
            token_usege = client.query(token_usege_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows
            client.close()  # Tutup koneksi setelah query selesai

            # Jika tidak ada data, kembalikan hasil kosong
            if not token_usege:
                return jsonify({"token usage": []})


            # Proses hasil query menjadi list of dict
            token_usege_result = []
            for row in token_usege:
                token_usege_result.append({
                    "date": row[0].strftime("%Y-%m-%d"),
                    "prompt": row[1],
                    "completion": row[2]
                })

            Avg_prompt_tokens_query ="""
            WITH request_counts_ok AS (
                    SELECT COUNT(
                        CASE 
                            WHEN StatusCode IN ('STATUS_CODE_OK') THEN 1
                            ELSE NULL
                        END
                    ) AS total_requests_ok
                    FROM otel_traces
                    WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
                ),
                prompt_counts AS (
                    SELECT SUM(
                        CASE 
                            WHEN StatusCode IN ('STATUS_CODE_OK') 
                            THEN toFloat64OrZero(SpanAttributes['gen_ai.usage.input_tokens']) 
                            ELSE 0
                        END
                    ) AS total_prompt
                    FROM otel_traces
                    WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
                )
                SELECT total_requests_ok, total_prompt, Round((total_prompt/total_requests_ok),6)  AS avg_prompt
                FROM request_counts_ok, prompt_counts
            """
            client = get_client()
            Avg_prompt_tokens = client.query(Avg_prompt_tokens_query,{'start_date': start_date_str, 'end_date': end_date_str}).result_rows[0][2]
            # total_prompt_tokens = client.query(Avg_prompt_tokens_query,{'start_date': start_date_str, 'end_date': end_date_str}).result_rows[0][1]
            client.close() 

            Top_Model_query = """
            WITH model_count AS (
                SELECT 
                    SpanAttributes['gen_ai.request.model'] AS model,
                    COUNT(CASE WHEN StatusCode = 'STATUS_CODE_OK' THEN 1 END) AS total_count_model
                FROM otel_traces
                WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
                GROUP BY model
            ),
            total_all_model AS (
                SELECT 
                    COUNT(CASE WHEN StatusCode = 'STATUS_CODE_OK' THEN 1 END) AS total_all
                FROM otel_traces
                WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            )
            SELECT 
                model, 
                (m.total_count_model / t.total_all) * 100 AS percentage
            FROM model_count m, total_all_model t
            ORDER BY percentage DESC
            LIMIT 5
            """
            client = get_client()
            Top_Model_result = client.query(Top_Model_query,{'start_date': start_date_str, 'end_date': end_date_str}).result_rows
            client.close() 

            if not Top_Model_result:
                return jsonify({"error": "No data found"})
            else:
                # Membuat dictionary JSON
                Top_Model = {
                    "Top Model": {
                        row[0]: [row[0].capitalize(), f"{float(row[1]):.2f}%"]
                        for row in Top_Model_result
                    }
                }
                Avg_completion_tokens_query ="""
            WITH request_counts_ok AS (
                SELECT COUNT(
                    CASE 
                        WHEN StatusCode = 'STATUS_CODE_OK' 
                            AND SpanAttributes['gen_ai.operation.name'] = 'chat' 
                        THEN 1 
                        ELSE NULL
                    END
                ) AS total_requests_ok
                FROM otel_traces
                WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
                ),
                prompt_counts AS (
                    SELECT SUM(
                        CASE 
                            WHEN StatusCode IN ('STATUS_CODE_OK') THEN toFloat64OrNull(SpanAttributes['gen_ai.usage.output_tokens'])  
                            ELSE 0
                        END
                    ) AS total_prompt
                    FROM otel_traces
                    WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
                )
                SELECT total_requests_ok, total_prompt, Round((total_prompt/total_requests_ok),6)  AS avg_prompt
                FROM request_counts_ok, prompt_counts
            """
            client = get_client()
            Avg_completion_tokens = client.query(Avg_completion_tokens_query,{'start_date': start_date_str, 'end_date': end_date_str}).result_rows[0][2]
            client.close() 

            total_request_query = """
            SELECT 
                toDate(Timestamp) AS date,
                    COUNT(CASE WHEN StatusCode = 'STATUS_CODE_OK' THEN 1 END) AS total_count_ok,
                    COUNT(CASE WHEN StatusCode = 'STATUS_CODE_UNSET' THEN 1 END) AS total_count_unset,
                    COUNT(CASE WHEN StatusCode = 'STATUS_CODE_ERROR' THEN 1 END) AS total_count_error
                
            FROM otel_traces
            WHERE Timestamp BETWEEN %(start_date)s AND %(end_date)s
            GROUP BY date
            ORDER BY date
            """

            client = get_client()
            total_request = client.query(total_request_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows
            client.close()  # Tutup koneksi setelah query selesai

            # Jika tidak ada data, kembalikan hasil kosong
            if not total_request:
                return jsonify({"total?": []})


            # Proses hasil query menjadi list of dict
            total_request_result = []
            for row in total_request:
                total_request_result.append({
                    "date": row[0].strftime("%Y-%m-%d"),
                    "total_count_ok": row[1],
                    "total_count_unset": row[2],
                    "total_count_error": row[3],
                })


            return jsonify({                
                "total_requests": total_requests,
                "start_date": start_date_str,
                "end_date": end_date_str,
                "avg_token": avg_token,
                "avg_cost": avg_cost,
                "avg_duration": avg_duration,
                **Cost_by_app,
                **Gen_by_category,
                **Cost_by_env,
                "token_usage": token_usege_result,
                "Avg_prompt_tokens" : Avg_prompt_tokens,
                "Avg_completion_tokens" : Avg_completion_tokens,
                **Top_Model,
                 "Total request": total_request_result,
            })

        except Exception as e:
            abort(500, f"Internal Server Error: {str(e)}")

api.add_resource(Angka, '/dashboard')

if __name__ == '__main__':
    app.run(debug=True)
