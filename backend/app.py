from dotenv import load_dotenv
import sys
sys.dont_write_bytecode = True
load_dotenv()
import clickhouse_connect
import os

from flask import Flask, request
from flask_restful import Resource, Api
from flask_cors import CORS

from endpoint.dashboard import Dashboard
from endpoint.request import Request
from endpoint.admin.chatbotapp import ProjectChatService
from endpoint.admin.chatbotapp import ChatHistoryService
from endpoint.database.databaseopenlit import client
from endpoint.exception import Exception
from endpoint.admin.apiKeys import apiKeys
from endpoint.admin.appcatalogue import AppCatalogue
from endpoint.login import AuthApp  
from endpoint.admin.pricing import PricingAPI
from endpoint.admin.vault import vault

app = Flask(__name__)

debug = True
CORS(app, 
     resources={r"*": {
         "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],  
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization", "Accept"],
         "supports_credentials": True,
         "allow_credentials": True  
     }},
     expose_headers=["Content-Type", "Authorization"])
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
app.register_blueprint(vault, url_prefix='/vault')
AuthApp(app)
PricingAPI(app)


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5101))  # Default to 5101
    app.run(host="0.0.0.0", port=port, debug=True)
