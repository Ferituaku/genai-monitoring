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
# from backend.vault import vault


# from modul.Login import before_request_func

app = Flask(__name__)

debug = True
CORS(app, resources={r"*": {"origins": "*"}})
api = Api(app)

client =  clickhouse_connect.get_client(host='openlit.my.id', port='8123', database="openlit", username='default',password='OPENLIT',
        secure=False  # Menghindari session locking
    )

api.add_resource(Dashboard, '/dashboard')
api.add_resource(Request,'/api/tracesRequest/','/api/tracesRequest/<string:appName>')
api.add_resource(ProjectChatService, '/api/projectchat')
api.add_resource(ChatHistoryService, '/api/chathistory/<string:unique_id_chat>')
api.add_resource(Exception, '/api/tracesExceptions/', '/api/tracesRequest/<string:appName>')
app.register_blueprint(apiKeys, url_prefix='/apiKeys')
# app.register_blueprint(vault, url_prefix='/vault')



# app.before_request(before_request_func)

if __name__ == '__main__':
    app.run(debug=debug, host='0.0.0.0')
