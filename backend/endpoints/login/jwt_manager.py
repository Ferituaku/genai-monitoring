from functools import wraps
from flask import jsonify, request
from datetime import datetime, timedelta
import pytz
import jwt

wib = pytz.timezone('Asia/Jakarta')

class JWTManager:
    
    def __init__(self, secret_key):
        self.secret_key = secret_key
        self.blacklisted_tokens = set()

    def generate_token(self, user_data):
        return jwt.encode({
            'user_id': user_data['id'],
            'name': user_data.get('name', ''),
            'email': user_data['email'],
            'role': user_data.get('role', 'user'),
            'exp': datetime.now(wib) + timedelta(hours=24)
        }, self.secret_key, algorithm="HS256")

    def decode_token(self, token):
        return jwt.decode(token, self.secret_key, algorithms=["HS256"])

    def blacklist_token(self, token):
        self.blacklisted_tokens.add(token)
    
    def token_required(self, f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            if 'Authorization' in request.headers:
                try:
                    token = request.headers['Authorization'].split(" ")[1]
                    if token in self.blacklisted_tokens:
                        return jsonify({'message': 'Token telah direvoke!'}), 401
                except IndexError:
                    return jsonify({'message': 'Token tidak valid!'}), 401
            
            if not token:
                return jsonify({'message': 'Token tidak ada!'}), 401
            
            try:
                data = self.decode_token(token)
                return f(data, *args, **kwargs)
            except jwt.ExpiredSignatureError:
                return jsonify({'message': 'Token telah kadaluarsa!'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'message': 'Token tidak valid!'}), 401
            except Exception as e:
                return jsonify({'message': 'Terjadi kesalahan!', 'error': str(e)}), 401

        return decorated