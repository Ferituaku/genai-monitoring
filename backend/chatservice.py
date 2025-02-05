from flask import Flask, jsonify, request
from flask_restful import Api, Resource
import clickhouse_connect
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
api = Api(app)

# Koneksi ke ClickHouse
client = clickhouse_connect.get_client(
    host='openlit.my.id',
    port=8123,
    database='openlit',
    username='default',
    password='OPENLIT'
)

class Traces(Resource):
    def get(self):
        try:
            # Mengambil UniqueIDChat dari parameter URL
            unique_id_chat = request.args.get("UniqueIDChat")

            if not unique_id_chat:
                return jsonify({"error": "UniqueIDChat parameter is required"}), 400

            # Query ClickHouse
            query = f"""
                SELECT 
                    (Timestamp) AS Tanggal,
                    SpanAttributes['ChatID'] AS ChatID,
                    SpanAttributes['Prompt'] AS Pertanyaan,
                    SpanAttributes['Answer'] AS Jawaban
                FROM openlit.otel_traces
                WHERE SpanAttributes['UniqueIDChat'] = '{unique_id_chat}'
                ORDER BY Timestamp DESC
            """

            # Jalankan query
            result = client.query(query).result_rows

            if not result:
                return jsonify({"message": "No data found for the given UniqueIDChat"}), 404

            # Format hasil menjadi JSON
            formatted_traces = [
                {
                    "Tanggal": row[0],
                    "ChatID": row[1],
                    "Pertanyaan": row[2],
                    "Jawaban": row[3]
                }
                for row in result
            ]

            return jsonify(formatted_traces)

        except Exception as e:
            return jsonify({"error": str(e)}), 500


# Menambahkan endpoint ke Flask
api.add_resource(Traces, '/chatservice')

if __name__ == '__main__':
    app.run(debug=True)
