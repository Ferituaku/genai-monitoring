from flask import Flask, jsonify, abort, request
from flask_restful import Api, Resource
import clickhouse_connect
from datetime import datetime, timedelta
from flask_cors import CORS
from backend.databaseopenlit import client

app = Flask(__name__)
CORS(app)
api = Api(app)

# Koneksi ClickHouse
client = clickhouse_connect.get_client(
    host='openlit.my.id',
    port=8123,
    database='openlit',
    username='default',
    password='OPENLIT'
)

class Exception(Resource):

    def __init__(self):
        self.client = client  
        self.days = request.args.get('days', default=7, type=int)

    def get(self, appName=None):  
        try:
            # Hitung tanggal mulai (hari ini - days)
            start_date = datetime.now() - timedelta(days=self.days)
            
            # Query utama untuk mendapatkan traces
            query = """
            SELECT 
                Timestamp,
                TraceId,
                SpanId,
                ParentSpanId,
                TraceState,
                SpanName,
                SpanKind,
                ServiceName,
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
            WHERE StatusCode IN ('STATUS_CODE_ERROR')
            AND Timestamp >= '{start_date}'
            """
            if appName:
                query += f" AND ServiceName = '{appName}'"
            query += " ORDER BY Timestamp DESC"

            query = query.format(start_date=start_date.strftime('%Y-%m-%d %H:%M:%S'))

            # Jalankan query
            traces = client.query(query).result_rows
            print(f"Raw Traces dari Query: {traces}")  # Debugging

            if not traces:
                print("Query tidak mengembalikan data, mengembalikan data kosong...")

            formatted_traces = []
            for row in traces:
                print(f"Row mentah: {row}")  # Debugging
                
                # Pastikan panjang row cukup sebelum mengakses indeks
                try:
                    trace_data = {
                        "Timestamp": row[0].isoformat() if isinstance(row[0], datetime) else str(row[0]),
                        "TraceId": row[1] if len(row) > 1 else "",
                        "SpanId": row[2] if len(row) > 2 else "",
                        "ParentSpanId": row[3] if len(row) > 3 else "",
                        "TraceState": row[4] if len(row) > 4 else "",
                        "SpanName": row[5] if len(row) > 5 else "",
                        "SpanKind": row[6] if len(row) > 6 else "",
                        "ServiceName": row[7] if len(row) > 7 else "",
                        "ResourceAttributes": row[8] if len(row) > 8 and isinstance(row[8], dict) else {},
                        "ScopeName": row[9] if len(row) > 9 else "",
                        "ScopeVersion": row[10] if len(row) > 10 else "",
                        "SpanAttributes": row[11] if len(row) > 11 and isinstance(row[11], dict) else {},
                        "Duration": row[12] if len(row) > 12 else "",
                        "StatusCode": row[13] if len(row) > 13 else "STATUS_CODE_OK",
                        "StatusMessage": row[14] if len(row) > 14 else "",
                        "Events.Timestamp": [ts.isoformat() if isinstance(ts, datetime) else str(ts) for ts in (row[15] if len(row) > 15 and isinstance(row[15], list) else [])],
                        "Events.Name": row[16] if len(row) > 16 and isinstance(row[16], list) else [],
                        "Events.Attributes": row[17] if len(row) > 17 and isinstance(row[17], list) else [],
                        "Links.TraceId": [],
                        "Links.SpanId": [],
                        "Links.TraceState": [],
                        "Links.Attributes": []
                    }
                    formatted_traces.append(trace_data)
                except IndexError as e:
                    print(f"Kesalahan parsing row: {str(e)}")

            return jsonify(formatted_traces)
            
        except Exception as e:
            print(f"Error dalam get: {str(e)}")  
            abort(500, f"Terjadi kesalahan server: {str(e)}")
