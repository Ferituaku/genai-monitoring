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
from backend.admin.chatbotapp import ProjectChatService
from backend.admin.chatbotapp import ChatHistoryService
from backend.database.databaseopenlit import client
from backend.exception import Exception
from backend.admin.apiKeys import apiKeys
from backend.admin.appcatalogue import AppCatalogue
from backend.login.AuthApp import AuthApp  
from backend.admin.pricing import PricingAPI
from backend.admin.vault import vault

app = Flask(__name__)

debug = True
CORS(app, 
     resources={r"*": {
         "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],  # Tambahkan kedua format URL
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization", "Accept"],
         "supports_credentials": True,
         "allow_credentials": True  # Tambahkan ini
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
    app.run(debug=debug, host='0.0.0.0')
