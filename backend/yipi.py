import clickhouse_connect
from flask import Flask, jsonify, request
from flask_restful import Api, Resource
from datetime import datetime, timedelta
from flask_cors import CORS

app = Flask(__name__)
api = Api(app)
CORS(app)

client = clickhouse_connect.get_client(host='openlit.my.id', port='8123', database="openlit", username='default', password='OPENLIT', secure=False)

class TotalRequests(Resource):
    def get(self):
        days = request.args.get('days', default=1, type=int)
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

        total_requests = client.query(total_request_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows[0][0]
        return jsonify({"total_requests": total_requests})

class AvgToken(Resource):
    def get(self):
        days = request.args.get('days', default=1, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        end_date = datetime.utcnow()
        start_date_str = start_date.strftime('%Y-%m-%d %H:%M:%S')
        end_date_str = end_date.strftime('%Y-%m-%d %H:%M:%S')

        avg_token_query = """
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

        avg_token = client.query(avg_token_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows[0][2]
        return jsonify({"avg_token": avg_token})

class AvgCost(Resource):
    def get(self):
        days = request.args.get('days', default=1, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        end_date = datetime.utcnow()
        start_date_str = start_date.strftime('%Y-%m-%d %H:%M:%S')
        end_date_str = end_date.strftime('%Y-%m-%d %H:%M:%S')

        avg_cost_query = """
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

        avg_cost = client.query(avg_cost_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows[0][2]
        return jsonify({"avg_cost": avg_cost})

class AvgDuration(Resource):
    def get(self):
        days = request.args.get('days', default=1, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        end_date = datetime.utcnow()
        start_date_str = start_date.strftime('%Y-%m-%d %H:%M:%S')
        end_date_str = end_date.strftime('%Y-%m-%d %H:%M:%S')

        avg_duration_query = """
            SELECT 
            Round((AVG(Duration)/1000000000),5) AS avg_duration
            FROM otel_traces
            WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
        """

        avg_duration = client.query(avg_duration_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows[0][0]
        return jsonify({"avg_duration": avg_duration})

class Yipi(Resource):
    def get(self):
        # Call each resource class's get() method and access result_rows directly
        total_requests = TotalRequests().get().json['total_requests']
        avg_token = AvgToken().get().json['avg_token']
        avg_cost = AvgCost().get().json['avg_cost']
        avg_duration = AvgDuration().get().json['avg_duration']

        return jsonify({
            "total_requests": total_requests,
            "avg_token": avg_token,
            "avg_cost": avg_cost,
            "avg_duration": avg_duration
        })

# Add resources to the API
api.add_resource(TotalRequests, '/total_requests')
api.add_resource(AvgToken, '/avg_token')
api.add_resource(AvgCost, '/avg_cost')
api.add_resource(AvgDuration, '/avg_duration')
api.add_resource(Yipi, '/yipi')

if __name__ == '__main__':
    app.run(debug=True)
