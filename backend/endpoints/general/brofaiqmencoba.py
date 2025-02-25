import os
from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from flask_restful import Resource, Api
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import AICORELibrary

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)
api = Api(app)

# Connect to AICORE
client = AICORELibrary.get_client(
    interface='https', 
    host='devproxy.astra.co.id/openai/lit_db', 
    port="empty", 
    database='openlit',
    username='astramonitoringclickhouse',
    password='CQ6JO9OG6asouyi3rkVFMgC1TfXX6dpr0Lvr7vP14IH830kLE1'
)

class Dashboard(Resource):
    def __init__(self):
        self.client = client  

    def get(self):
        try:
            days = request.args.get('days', type=int)
            from_date = request.args.get('from')
            to_date = request.args.get('to')

            if from_date and to_date:
                try:
                    start_date_str = datetime.fromisoformat(from_date.replace('Z', '+00:00'))
                    end_date_str = datetime.fromisoformat(to_date.replace('Z', '+00:00'))
                except ValueError:
                    abort(400, "Invalid date format. Use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)")
            elif days:
                start_date_str = datetime.now(timezone.utc) - timedelta(days=days)
                end_date_str = datetime.now(timezone.utc)
            else:
                start_date_str = datetime.now(timezone.utc) - timedelta(days=7)
                end_date_str = datetime.now(timezone.utc)

            query_params = {'start_date': start_date_str, 'end_date': end_date_str}
            top_model_query = """
            SELECT 
                SpanAttributes['gen_ai.request.model'] AS model,
                COUNT(*) AS total_count_model
            FROM otel_traces
            WHERE 
                SpanAttributes['gen_ai.request.model'] IS NOT NULL 
                AND SpanAttributes['gen_ai.request.model'] <> ''
                AND StatusCode = 'STATUS_CODE_OK'
                AND Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            GROUP BY SpanAttributes['gen_ai.request.model']
            """

           
            top_model_result = client.query(top_model_query, query_params).result_rows

            if not top_model_result:
                return jsonify({"error": "No data found"})

            cost_data = {row[0]: float(row[1]) for row in top_model_result if row[0]}

            # Query total request OK
            total_ok_query = """
            SELECT COUNT(*) AS total_requests_ok
            FROM otel_traces
            WHERE StatusCode = 'STATUS_CODE_OK'
            AND Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            """
            total_ok_result = client.query(total_ok_query, query_params).result_rows
            total_ok_count = int(total_ok_result[0][0]) if total_ok_result else 0

            # Hitung persentase setiap model
            for model in cost_data:
                cost_data[model] = {
                    "total_count": cost_data[model],
                    "percentage_of_total": f"{(cost_data[model] / total_ok_count) * 100:.2f}%"
                    if total_ok_count > 0 else "0.00%"
                }

            return jsonify({                
                "start_date": start_date_str.isoformat(),
                "end_date": end_date_str.isoformat(),
                "top_model": cost_data,
                "total_ok_requests": total_ok_count
            })

        except Exception as e:
            abort(500, f"Unexpected error: {str(e)}")


api.add_resource(Dashboard, '/dashboard')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
