from flask import Flask, request, jsonify, url_for, redirect, session
from flask_cors import CORS
from flask_session import Session
from authlib.integrations.flask_client import OAuth
import jwt
from datetime import datetime, timedelta
from functools import wraps
import os
from dotenv import load_dotenv
from db import Database

class GoogleOAuth:
    def __init__(self, app, oauth):
        self.app = app
        self.oauth = oauth
        self.google = self._setup_google()

    def _setup_google(self):
        return self.oauth.register(
            name='google',
            client_id=self.app.config['GOOGLE_CLIENT_ID'],
            client_secret=self.app.config['GOOGLE_CLIENT_SECRET'],
            server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
            client_kwargs={
                'scope': 'openid email profile',
                'prompt': 'select_account'
            },
            access_token_url='https://oauth2.googleapis.com/token',
            authorize_url='https://accounts.google.com/o/oauth2/v2/auth',
            api_base_url='https://www.googleapis.com/oauth2/v2/',
        )

    def logout(self):
        session.pop('state', None)

class UserManager:
    def __init__(self, db):
        self.db = db
        self.init_users_table()

    def init_users_table(self):
        query = '''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            google_id TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            name TEXT,
            avatar_url TEXT
        )
        '''
        self.db.execute_query(query)

    def get_user_by_email(self, email):
        return self.db.fetch_one('SELECT * FROM users WHERE email = ?', (email,))

    def get_user_by_id(self, user_id):
        return self.db.fetch_one('SELECT * FROM users WHERE id = ?', (user_id,))

    def update_user(self, email, user_data):
        query = '''
            UPDATE users 
            SET google_id = ?, name = ?, avatar_url = ?, last_login = ? 
            WHERE email = ?
        '''
        self.db.execute_query(query, (
            user_data.get('sub'),
            user_data.get('name', ''),
            user_data.get('picture', ''),
            datetime.utcnow(),
            email
        ))

    def create_user(self, user_data):
        query = '''
            INSERT INTO users (email, google_id, name, avatar_url, last_login)
            VALUES (?, ?, ?, ?, ?)
        '''
        self.db.execute_query(query, (
            user_data.get('email'),
            user_data.get('sub'),
            user_data.get('name', ''),
            user_data.get('picture', ''),
            datetime.utcnow()
        ))
        return self.get_user_by_email(user_data.get('email'))

class JWTManager:
    def __init__(self, secret_key):
        self.secret_key = secret_key
        self.blacklisted_tokens = set()

    def generate_token(self, user_data):
        return jwt.encode({
            'user_id': user_data['id'],
            'email': user_data['email'],
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, self.secret_key)

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
                    if token in self.blacklisted_tokens:  # Cek blacklist
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

class AuthApp:
    def __init__(self):
        load_dotenv()
        self.app = Flask(__name__)
        CORS(self.app)
        
        # Config
        self.app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')
        self.app.config['SESSION_TYPE'] = 'filesystem'
        self.app.config['GOOGLE_CLIENT_ID'] = os.getenv('GOOGLE_CLIENT_ID')
        self.app.config['GOOGLE_CLIENT_SECRET'] = os.getenv('GOOGLE_CLIENT_SECRET')
        
        Session(self.app)
        
        # Initialize components
        self.db = Database()
        self.oauth = OAuth(self.app)
        self.google_oauth = GoogleOAuth(self.app, self.oauth)
        self.user_manager = UserManager(self.db)
        self.jwt_manager = JWTManager(self.app.config['SECRET_KEY'])
        
        # Register routes
        self._register_routes()

    def _register_routes(self):
        # Auth routes
        @self.app.route('/login/google')
        def google_login():
            session['state'] = os.urandom(16).hex()
            return self.google_oauth.google.authorize_redirect(
                redirect_uri=url_for('google_authorize', _external=True),
                state=session['state']
            )

        @self.app.route('/login/google/authorize')
        def google_authorize():
            try:
                if 'state' not in session:
                    return jsonify({'message': 'State tidak ditemukan!'}), 400
                
                token = self.google_oauth.google.authorize_access_token()
                if not token:
                    return jsonify({'message': 'Gagal mendapatkan token!'}), 401
                
                resp = self.google_oauth.google.get('userinfo')
                if not resp:
                    return jsonify({'message': 'Gagal mendapatkan info user!'}), 401
                
                user_info = resp.json()
                if not user_info or 'email' not in user_info:
                    return jsonify({'message': 'Data user tidak lengkap!'}), 401

                existing_user = self.user_manager.get_user_by_email(user_info.get('email'))
                
                if existing_user:
                    self.user_manager.update_user(user_info.get('email'), user_info)
                    user_id = existing_user['id']
                else:
                    new_user = self.user_manager.create_user(user_info)
                    user_id = new_user['id']

                token = self.jwt_manager.generate_token({
                    'id': user_id,
                    'email': user_info.get('email')
                })
                
                frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
                return redirect(f'{frontend_url}/auth/callback?token={token}')

            except Exception as e:
                print("Authorization Error:", str(e))
                return jsonify({'message': f'Authorization error: {str(e)}'}), 500

        @self.app.route('/logout', methods=['POST'])
        @self.jwt_manager.token_required
        def logout(token_data):
            try:
                token = request.headers['Authorization'].split(" ")[1]
                self.jwt_manager.blacklist_token(token)  # Blacklist token
                self.google_oauth.logout()
                return jsonify({
                    'message': 'Logout berhasil',
                    'status': 'success'
                })
            except Exception as e:
                return jsonify({
                    'message': f'Logout error: {str(e)}',
                    'status': 'error'
                }), 500

        @self.app.route('/refresh-token', methods=['POST'])
        def refresh_token():
            if 'Authorization' not in request.headers:
                return jsonify({'message': 'Token tidak ada!'}), 401
            
            token = request.headers.get('Authorization').split()[1]
            try:
                data = self.jwt_manager.decode_token(token)
                new_token = self.jwt_manager.generate_token({
                    'id': data['user_id'],
                    'email': data['email']
                })
                return jsonify({'token': new_token})
            except:
                return jsonify({'message': 'Token tidak valid!'}), 401

        @self.app.route('/profile', methods=['GET'])
        @self.jwt_manager.token_required
        def get_profile(token_data):
            user = self.user_manager.get_user_by_id(token_data['user_id'])
            if user:
                return jsonify(dict(user))
            return jsonify({'message': 'User tidak ditemukan!'}), 404

        @self.app.route('/check-auth', methods=['GET'])
        @self.jwt_manager.token_required
        def check_auth(token_data):
            return jsonify({'message': 'Token valid!'})

    def run(self):
        self.app.run(debug=True)

if __name__ == '__main__':
    auth_app = AuthApp()
    auth_app.run()