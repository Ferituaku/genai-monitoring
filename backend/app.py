from flask import Flask, jsonify, request, abort
from flask_restful import Api, Resource, reqparse, marshal_with, fields
import clickhouse_connect
from datetime import datetime, timedelta
import openlit

app = Flask(__name__)
api = Api(app)

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

class Traces(Resource):
    @marshal_with(trace_fields)
    def get(self, appName=None):
        try:
            if appName:
                # Query untuk aplikasi spesifik dengan kutipan string yang benar
                query = f"SELECT * FROM otel_traces WHERE ServiceName = '{appName}'"
                traces = client.query(query).result_rows
                if not traces:
                    abort(404, f"Traces for app '{appName}' not found")
                return self.format_traces(traces)
            else:
                # Query untuk semua aplikasi
                traces = client.query('SELECT * FROM otel_traces').result_rows
                return self.format_traces(traces)
        except Exception as e:
            abort(500, f"Internal Server Error: {str(e)}")

    @staticmethod
    def format_traces(traces):
        formatted_data = []
        for row in traces:
            try:
                formatted_data.append({
                    "timestamp": row[0].isoformat(),
                    "trace_id": row[1],
                    "span_id": row[2],
                    "operation_name": row[5],
                    "kind": row[6],
                    "app_name": row[7],
                    "attributes": row[8],
                    "additional_info": row[9],
                    "completion_text": row[17] if len(row) > 17 else None
                })
            except IndexError:
                continue  # Abaikan baris yang tidak lengkap
        return formatted_data

api.add_resource(Traces, '/api/traces/', '/api/traces/<string:appName>')


@app.route('/')
def home():
    return '<h1>Flask Rest API for ClickHouse</h1>'

if __name__ == '__main__':
    app.run(debug=True)