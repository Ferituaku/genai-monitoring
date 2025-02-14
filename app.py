from dotenv import load_dotenv
import sys
sys.dont_write_bytecode = True
load_dotenv()
import clickhouse_connect

from flask import Flask, request
from flask_restful import Resource, Api
from flask_cors import CORS
from backend.dashboard import Dashboard
from backend.request import Request
from backend.chatbotapp import ProjectChatService
from backend.chatbotapp import ChatHistoryService
from backend.databaseopenlit import client
from backend.exception import Exception
from backend.apiKeys import apiKeys
from backend.appcatalogue import AppCatalogue
from backend.login import AuthApp  
from backend.pricing import PricingAPI
import os

app = Flask(__name__)

debug = True
CORS(app, resources={r"*": {"origins": "*"}})
api = Api(app)

client =  clickhouse_connect.get_client(host='openlit.my.id', port='8123', database="openlit", username='default',password='OPENLIT',
        secure=False 
    )

api.add_resource(Dashboard, '/dashboard')
api.add_resource(Request,'/api/tracesRequest/','/api/tracesRequest/<string:appName>')
api.add_resource(ProjectChatService, '/api/projectchat')
api.add_resource(ChatHistoryService, '/api/chathistory/<string:unique_id_chat>')
api.add_resource(Exception, '/api/tracesExceptions/', '/api/tracesRequest/<string:appName>')
api.add_resource(AppCatalogue, "/appcatalogue")
app.register_blueprint(apiKeys, url_prefix='/apiKeys')
AuthApp(app)
PricingAPI(app)


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5101))  # Default to 5101
    app.run(host="0.0.0.0", port=port, debug=True)
