from dotenv import load_dotenv
import sys
sys.dont_write_bytecode = True
load_dotenv()
import os
from flask import Flask
from flask_restful import Api
from flask_cors import CORS

from endpoints.general.dashboard import Dashboard
from endpoints.general.request import Request
from endpoints.admin.chatbotapp import ProjectChatService
from endpoints.admin.chatbotapp import ChatHistoryService
from endpoints.general.exception import Exception
from endpoints.admin.apiKeys import apiKeys
from endpoints.admin.appcatalogue import AppCatalogue
from endpoints.admin.pricing import PricingAPI
from endpoints.admin.vault import vault
from endpoints.admin.appcatalogue import AppCatalogueLogo
from endpoints.general.filterRequest import FilterOptions
from endpoints.admin.evaluation import GetAllFile, DeleteFileJson, GetJsonById, ExportFileToCSV
from endpoints.admin.mlops_system import UploadDataMlops
from endpoints.login.user_routes import UserRoutes, UsersList
from endpoints.login.user_manager import UserManager

app = Flask(__name__)

debug = True
CORS(app, resources={r"*": {"origins": "*"}})
api = Api(app)

# Inisialisasi user manager
user_manager = UserManager()

api.add_resource(Dashboard, '/dashboard')
api.add_resource(Request,'/api/tracesRequest/')
api.add_resource(ProjectChatService, '/api/projectchat')
api.add_resource(ChatHistoryService, '/api/chathistory/<string:unique_id_chat>')
api.add_resource(Exception, '/api/tracesExceptions/')
api.add_resource(AppCatalogue, "/appcatalogue")
api.add_resource(AppCatalogueLogo, '/api/applogo', '/api/applogo/<string:project_name>')
app.register_blueprint(apiKeys, url_prefix='/apiKeys')
app.register_blueprint(vault, url_prefix='/vault')
api.add_resource(FilterOptions, '/api/filterOptions')
api.add_resource(UploadDataMlops, '/upload')
api.add_resource(GetAllFile, '/file_json')
api.add_resource(DeleteFileJson, '/delete_file')
api.add_resource(ExportFileToCSV, '/export_csv') 
api.add_resource(GetJsonById, '/get_json')

# Tambahkan user routes ke API
api.add_resource(UsersList, '/api/users', 
                resource_class_kwargs={'user_manager': user_manager})
api.add_resource(UserRoutes, 
                '/api/users/<string:sso_id>', 
                resource_class_kwargs={'user_manager': user_manager})

PricingAPI(app)


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5101))  # Default to 5101
    app.run(host="0.0.0.0", port=port, debug=True)