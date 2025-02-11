from dotenv import load_dotenv
import sys
sys.dont_write_bytecode = True
load_dotenv()

from flask import Flask, request
from flask_restful import Resource, Api
from flask_cors import CORS
from backend.dashboard import Dashboard
from backend.request import Request

# from modul.Login import before_request_func

app = Flask(__name__)

debug = True
CORS(app, resources={r"*": {"origins": "*"}})
api = Api(app)

api.add_resource(Dashboard, '/dashboard')
api.add_resource(Request,'/api/tracesRequest/', '/api/tracesRequest/<string:appName>')


# app.before_request(before_request_func)

if __name__ == '__main__':
    app.run(debug=debug, host='0.0.0.0')
