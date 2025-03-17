from dotenv import load_dotenv
import sys
sys.dont_write_bytecode = True
load_dotenv()
import os

from flask import Flask
from flask_restful import Api
from flask_cors import CORS
# from flask_compress import Compress

from endpoints.general.dashboard import Dashboard
from endpoints.general.request import Request
from endpoints.admin.chatbotapp import ProjectChatService
from endpoints.admin.chatbotapp import ChatHistoryService
from endpoints.general.exception import Exception
from endpoints.admin.apiKeys import apiKeys
from endpoints.admin.appcatalogue import AppCatalogue
from endpoints.general.login import AuthApp  
from endpoints.admin.pricing import PricingAPI
from endpoints.admin.vault import vault
from endpoints.admin.appcatalogue import AppCatalogueLogo

app = Flask(__name__)

debug = True
CORS(app, resources={r"*": {"origins": "*"}})
api = Api(app)


api.add_resource(Dashboard, '/dashboard')
api.add_resource(Request,'/api/tracesRequest/')
api.add_resource(ProjectChatService, '/api/projectchat')
api.add_resource(ChatHistoryService, '/api/chathistory/<string:unique_id_chat>')
api.add_resource(Exception, '/api/tracesExceptions/')
api.add_resource(AppCatalogue, "/appcatalogue")
api.add_resource(AppCatalogueLogo, '/api/applogo', '/api/applogo/<string:project_name>')
app.register_blueprint(apiKeys, url_prefix='/apiKeys')
app.register_blueprint(vault, url_prefix='/vault')
AuthApp(app)
PricingAPI(app)


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5101))  # Default to 5101
    app.run(host="0.0.0.0", port=port, debug=True)
