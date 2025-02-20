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
          # Query untuk total prompt tokens
            # Query untuk total prompt tokens
            total_status_ok_query = """
            SELECT 
                toDate(Timestamp) AS date,
                SUM(CASE WHEN StatusCode = 'STATUS_CODE_OK' THEN 1 ELSE 0 END) AS total_status_ok
            FROM otel_traces
            WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            GROUP BY date
            """

            total_status_unset_query = """
            SELECT 
                toDate(Timestamp) AS date,
                SUM(CASE WHEN StatusCode = 'STATUS_CODE_UNSET' THEN 1 ELSE 0 END) AS total_status_unset
            FROM otel_traces
            WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            GROUP BY date
            """

            total_status_error_query = """
            SELECT 
                toDate(Timestamp) AS date,
                SUM(CASE WHEN StatusCode = 'STATUS_CODE_error' THEN 1 ELSE 0 END) AS total_status_error
            FROM otel_traces
            WHERE Timestamp BETWEEN toDateTime(%(start_date)s) AND toDateTime(%(end_date)s)
            GROUP BY date
            """

            # Jalankan query
            total_status_ok_result = client.query(total_status_ok_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows
            total_status_unset_result = client.query(total_status_unset_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows
            total_status_error_result = client.query(total_status_error_query, {'start_date': start_date_str, 'end_date': end_date_str}).result_rows

            # Gabungkan hasil berdasarkan tanggal
            total_data = {}

            for row in total_status_ok_result:
                date = row[0].strftime("%d-%m-%Y")
                total_data[date] = {"total_status_ok": int(row[1])}

            for row in total_status_unset_result:
                date = row[0].strftime("%d-%m-%Y")
                if date in total_data:
                    total_data[date]["total_status_unset"] = int(row[1])
                else:
                    total_data[date] = {"total_status_unset": int(row[1])}

            for row in total_status_error_result:
                date = row[0].strftime("%d-%m-%Y")
                if date in total_data:
                    total_data[date]["total_status_error"] = int(row[1])
                else:
                    total_data[date] = {"total_status_error": int(row[1])}

            # Return response
            return jsonify({
                "start_date": start_date_str,
                "end_date": end_date_str,
                "request_per_time": total_data
            })


        except Exception as e:
            abort(500, f"Unexpected error: {str(e)}")


api.add_resource(Dashboard, '/dashboard')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
