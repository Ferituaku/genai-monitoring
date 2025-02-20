from dotenv import load_dotenv
import sys
sys.dont_write_bytecode = True
load_dotenv()
import clickhouse_connect
import os

from flask import Flask, request
from flask_restful import Resource, Api
from flask_cors import CORS

from endpoints.general.dashboard import Dashboard
from endpoints.general.request import Request
from endpoints.admin.chatbotapp import ProjectChatService
from endpoints.admin.chatbotapp import ChatHistoryService
from data.configuration.databaseopenlit import client
from endpoints.general.exception import Exception
from endpoints.admin.apiKeys import apiKeys
from endpoints.admin.appcatalogue import AppCatalogue
from endpoints.general.login import AuthApp  
from endpoints.admin.pricing import PricingAPI
from endpoints.admin.vault import vault

app = Flask(__name__)

debug = True
CORS(app, resources={r"*": {"origins": "*"}})

api = Api(app)


api.add_resource(Dashboard, '/dashboard')
api.add_resource(Request,'/api/tracesRequest/','/api/tracesRequest/<string:appName>')
api.add_resource(ProjectChatService, '/api/projectchat')
api.add_resource(ChatHistoryService, '/api/chathistory/<string:unique_id_chat>')
api.add_resource(Exception, '/api/tracesExceptions/', '/api/tracesRequest/<string:appName>')
api.add_resource(AppCatalogue, "/appcatalogue")
app.register_blueprint(apiKeys, url_prefix='/apiKeys')
app.register_blueprint(vault, url_prefix='/vault')
# AuthApp(app)
PricingAPI(app)


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8000))  # Default to 5101
    app.run(host="0.0.0.0", port=port, debug=True)
