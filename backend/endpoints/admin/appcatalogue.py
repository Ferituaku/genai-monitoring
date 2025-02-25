from flask import jsonify, request
from flask_restful import Resource
from data.configuration.databaseopenlit import client

class AppCatalogue(Resource):

    def get(self):
        try:
            app_catalogue_query = """
                SELECT 
                ServiceName,
                COUNT(*) AS TotalRequests, 
                MIN(Timestamp) AS FirstRequest,
                MAX(Timestamp) AS LastRequest
            FROM openlit.otel_traces
            WHERE ServiceName IS NOT NULL
            GROUP BY ServiceName
            ORDER BY LastRequest DESC, FirstRequest DESC
            """
            
            app_catalogue = client.query(app_catalogue_query).result_rows
            # Tutup koneksi setelah query selesai

            # Jika tidak ada data, kembalikan hasil kosong
            if not app_catalogue :
                return jsonify({"token usage": []})


            # Proses hasil query menjadi list of dict
            app_catalogue_result = []
            for row in app_catalogue:
                app_catalogue_result.append({
                    "Project name" : row[0],
                    "Jumlah Request" :row[1],
                    "Created at" : row[2],
                    "Last update" :row[3]
                })

            return jsonify(app_catalogue_result)

        
        except Exception as e:
            print(f"Error occurred: {str(e)}")
            return jsonify({"error": str(e)}), 500

        except Exception as e:
            return jsonify({"error": str(e)}), 500


