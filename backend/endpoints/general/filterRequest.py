from flask import jsonify
from flask_restful import Resource
from data.configuration.databaseopenlit import client

class FilterOptions(Resource):
    def __init__(self):
        self.client = client
    
    def get(self):
        try:
            # Model query
            model_query = """
            SELECT DISTINCT SpanAttributes['gen_ai.request.model']
            FROM otel_traces
            WHERE SpanAttributes['gen_ai.request.model'] IS NOT NULL AND length(SpanAttributes['gen_ai.request.model']) > 0
            """
            
            # Environment query
            env_query = """
            SELECT DISTINCT ResourceAttributes['deployment.environment']
            FROM otel_traces
            WHERE ResourceAttributes['deployment.environment'] IS NOT NULL
            """
            
            model_result = self.client.query(model_query)
            env_result = self.client.query(env_query)
            
            model_querry = [row[0] for row in model_result.result_rows] if hasattr(model_result, 'result_rows') else []
            env_query = [row[0] for row in env_result.result_rows] if hasattr(env_result, 'result_rows') else []
            
            return jsonify({
                "models": model_querry,
                "environments": env_query
            })
            
        except Exception as e:
            return {"message": f"Internal server error: {str(e)}"}, 500