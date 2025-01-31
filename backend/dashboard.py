from flask import Flask, jsonify, request, abort
from flask_restful import Api, Resource, reqparse, marshal_with, fields
import clickhouse_connect
from datetime import datetime, timedelta
from flask_cors import CORS

app = Flask(__name__)
api = Api(app)
CORS(app)

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
    'span_id': fields.String,
    'operation_name': fields.String,
    'kind': fields.String,
    'app_name': fields.String,
    'attributes': fields.Raw,
    'additional_info': fields.Raw,
    'completion_text': fields.String
}

class Angka(Resource):
    def get(self):
        try:
            # Query untuk total request
            total_request_query = """
                SELECT COUNT(
                    CASE 
                        WHEN StatusCode IN ('STATUS_CODE_OK','STATUS_CODE_UNSET') THEN 1 
                        ELSE NULL 
                    END
                ) AS total_requests 
                FROM otel_traces
            """
            total_requests = client.query(total_request_query).result_rows[0][0]


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
                ),
                token_counts AS (
                    SELECT SUM(
                        CASE 
                            WHEN StatusCode IN ('STATUS_CODE_OK') THEN CAST(SpanAttributes['gen_ai.usage.total_tokens'] AS Float64)
                            ELSE 0
                        END
                    ) AS total_tokens
                    FROM otel_traces
                )
                SELECT total_requests_ok, total_tokens, Round((total_tokens/total_requests_ok),5)  AS avg_token
                FROM request_counts_ok, token_counts
            """
            avg_token = client.query(avg_token_query).result_rows[0][2]

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
                ),
                cost_counts AS (
                    SELECT SUM(
                        CASE 
                            WHEN StatusCode IN ('STATUS_CODE_OK') THEN CAST(SpanAttributes['gen_ai.usage.cost'] AS Float64)
                            ELSE 0
                        END
                    ) AS total_cost
                    FROM otel_traces
                )
                SELECT total_requests_ok, total_cost, Round((total_cost/total_requests_ok),8)  AS avg_cost
                FROM request_counts_ok, cost_counts
            """
            avg_cost = client.query(avg_cost_query).result_rows[0][2]


            avg_duration_query = """
                SELECT 
                Round((AVG(
                    Duration
                )/1000000000),5) AS avg_duration
                FROM otel_traces
            """
            avg_duration = client.query(avg_duration_query).result_rows[0][0]

            Request_Data_query = """
                SELECT
                    COUNT(CASE WHEN StatusCode = 'STATUS_CODE_OK' THEN 1 END) AS total_count_ok,
                    COUNT(CASE WHEN StatusCode = 'STATUS_CODE_UNSET' THEN 1 END) AS total_count_unset,
                    COUNT(CASE WHEN StatusCode = 'STATUS_CODE_ERROR' THEN 1 END) AS total_count_error
                FROM otel_traces
            """
            Request_Data_Result = client.query(Request_Data_query).result_rows[0]
            Request_Data_Result = {
                "status_ok": Request_Data_Result[0],
                "status_unset": Request_Data_Result[1],
                "status_error": Request_Data_Result[2]
            }

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

            Cost_by_app_result = client.query(Cost_by_app_query).result_rows

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
            Gen_by_category_result = client.query(Gen_by_category_query).result_rows

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
            Cost_by_env_result = client.query(Cost_by_env_query).result_rows

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

            Avg_prompt_tokens_query ="""
            WITH request_counts_ok AS (
                    SELECT COUNT(
                        CASE 
                            WHEN StatusCode IN ('STATUS_CODE_OK') THEN 1
                            ELSE NULL
                        END
                    ) AS total_requests_ok
                    FROM otel_traces
                ),
                prompt_counts AS (
                    SELECT SUM(
                        CASE 
                            WHEN StatusCode IN ('STATUS_CODE_OK') THEN CAST(SpanAttributes['gen_ai.usage.input_tokens'] AS Float64)
                            ELSE 0
                        END
                    ) AS total_prompt
                    FROM otel_traces
                )
                SELECT total_requests_ok, total_prompt, Round((total_prompt/total_requests_ok),6)  AS avg_prompt
                FROM request_counts_ok, prompt_counts
            """

            Avg_prompt_tokens = client.query(Avg_prompt_tokens_query).result_rows[0][2]
            total_prompt_tokens = client.query(Avg_prompt_tokens_query).result_rows[0][1]

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
                ),
                prompt_counts AS (
                    SELECT SUM(
                        CASE 
                            WHEN StatusCode IN ('STATUS_CODE_OK') THEN toFloat64OrNull(SpanAttributes['gen_ai.usage.output_tokens'])  
                            ELSE 0
                        END
                    ) AS total_prompt
                    FROM otel_traces
                )
                SELECT total_requests_ok, total_prompt, Round((total_prompt/total_requests_ok),6)  AS avg_prompt
                FROM request_counts_ok, prompt_counts
            """

            Avg_completion_tokens = client.query(Avg_completion_tokens_query).result_rows[0][2]
            total_completion_tokens = client.query(Avg_completion_tokens_query).result_rows[0][1]
            

            # Mengembalikan hasil dalam format JSON     
            return jsonify({
                "total_requests": total_requests,
                "avg_token": avg_token,
                "avg_cost": avg_cost,
                "avg_duration" : avg_duration,
                "Prompt_OK": Request_Data_Result["status_ok"],
                "Prompt_Unset": Request_Data_Result["status_unset"],
                "Prompt_Error": Request_Data_Result["status_error"],
                **Gen_by_category,
                **Cost_by_app ,
                **Cost_by_env,
                "avg_prompt_tokens" : Avg_prompt_tokens,
                "avg_completion_tokens" : Avg_completion_tokens,
                "Completion": total_completion_tokens,
                "Prompt": total_prompt_tokens
                
            })
        except Exception as e:
            abort(500, f"Internal Server Error: {str(e)}")

# Tambahkan resource ke API Flask
api.add_resource(Angka, '/dashboard')

if __name__ == '__main__':
    app.run(debug=True)
