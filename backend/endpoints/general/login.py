from flask import request, jsonify, url_for, redirect, session
from flask_cors import CORS
from flask_session import Session
from authlib.integrations.flask_client import OAuth
import jwt
from datetime import datetime, timedelta
from functools import wraps
import os
from dotenv import load_dotenv
from data.configuration.db import Database
import pytz

# Gunakan timezone WIB
wib = pytz.timezone('Asia/Jakarta')

class SSOAuth:
    def __init__(self, app, oauth):
        self.app = app
        self.oauth = oauth
        self.sso_client = self._setup_sso()

    def _setup_sso(self):
        return self.oauth.register(
            name='sso',
            client_id=self.app.config['SSO_CLIENT_ID'],
            client_secret=self.app.config['SSO_CLIENT_SECRET'],
            server_metadata_url=self.app.config['SSO_METADATA_URL'],
            client_kwargs={
                'scope': 'openid email profile',
                'prompt': 'select_account'
            },
            access_token_url=self.app.config['SSO_TOKEN_URL'],
            authorize_url=self.app.config['SSO_AUTHORIZE_URL'],
            api_base_url=self.app.config['SSO_API_BASE_URL'],
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
            sso_id TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            name TEXT,
            avatar_url TEXT,
            roles TEXT,
            department TEXT
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
            SET sso_id = ?, name = ?, avatar_url = ?, last_login = ?, roles = ?, department = ? 
            WHERE email = ?
        '''
        self.db.execute_query(query, (
            user_data.get('sub'),
            user_data.get('name', ''),
            user_data.get('picture', ''),
            datetime.utcnow(),
            user_data.get('roles', ''),
            user_data.get('department', ''),
            email
        ))

    def create_user(self, user_data):
        query = '''
            INSERT INTO users (email, sso_id, name, avatar_url, last_login, roles, department)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        '''
        self.db.execute_query(query, (
            user_data.get('email'),
            user_data.get('sub'),
            user_data.get('name', ''),
            user_data.get('picture', ''),
            datetime.utcnow(),
            user_data.get('roles', ''),
            user_data.get('department', '')
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
            'roles': user_data.get('roles', ''),
            'exp': datetime.now(wib) + timedelta(hours=24)
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

    def role_required(self, role):
        def decorator(f):
            @wraps(f)
            @self.token_required
            def decorated_function(token_data, *args, **kwargs):
                roles = token_data.get('roles', '').split(',')
                if role in roles:
                    return f(token_data, *args, **kwargs)
                return jsonify({'message': 'Akses ditolak, peran tidak memadai!'}), 403
            return decorated_function
        return decorator


class AuthApp:
    def __init__(self, app):
        load_dotenv()
        self.app = app
        CORS(self.app)
        
        # Config
        self.app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')
        self.app.config['SESSION_TYPE'] = 'filesystem'
        
        # SSO Configuration
        self.app.config['SSO_CLIENT_ID'] = os.getenv('SSO_CLIENT_ID')
        self.app.config['SSO_CLIENT_SECRET'] = os.getenv('SSO_CLIENT_SECRET')
        self.app.config['SSO_METADATA_URL'] = os.getenv('SSO_METADATA_URL', '')
        self.app.config['SSO_TOKEN_URL'] = os.getenv('SSO_TOKEN_URL', '')
        self.app.config['SSO_AUTHORIZE_URL'] = os.getenv('SSO_AUTHORIZE_URL', '')
        self.app.config['SSO_API_BASE_URL'] = os.getenv('SSO_API_BASE_URL', '')
        
        Session(self.app)
        
        # Initialize components
        self.db = Database()
        self.oauth = OAuth(self.app)
        self.sso_auth = SSOAuth(self.app, self.oauth)
        self.user_manager = UserManager(self.db)
        self.jwt_manager = JWTManager(self.app.config['SECRET_KEY'])
        
        # Register routes
        self._register_routes()

    def _register_routes(self):
        # Auth routes
        @self.app.route('/login/sso')
        def sso_login():
            session['state'] = os.urandom(16).hex()
            return self.sso_auth.sso_client.authorize_redirect(
                redirect_uri=url_for('sso_authorize', _external=True),
                state=session['state']
            )

        @self.app.route('/login/sso/authorize')
        def sso_authorize():
            try:
                if 'state' not in session:
                    return jsonify({'message': 'State tidak ditemukan!'}), 400
                
                token = self.sso_auth.sso_client.authorize_access_token()
                if not token:
                    return jsonify({'message': 'Gagal mendapatkan token!'}), 401
                
                resp = self.sso_auth.sso_client.get('userinfo')
                if not resp:
                    return jsonify({'message': 'Gagal mendapatkan info user!'}), 401
                
                user_info = resp.json()
                if not user_info or 'email' not in user_info:
                    return jsonify({'message': 'Data user tidak lengkap!'}), 401

                existing_user = self.user_manager.get_user_by_email(user_info.get('email'))
                
                if existing_user:
                    self.user_manager.update_user(user_info.get('email'), user_info)
                    user_data = {
                        'id': existing_user['id'],
                        'email': user_info.get('email'),
                        'roles': user_info.get('roles', '')
                    }
                else:
                    new_user = self.user_manager.create_user(user_info)
                    user_data = {
                        'id': new_user['id'],
                        'email': user_info.get('email'),
                        'roles': user_info.get('roles', '')
                    }

                token = self.jwt_manager.generate_token(user_data)
                
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
                self.sso_auth.logout()
                
                # Redirect ke SSO logout URL jika ada
                sso_logout_url = os.getenv('SSO_LOGOUT_URL')
                frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
                
                if sso_logout_url:
                    return jsonify({
                        'message': 'Logout berhasil',
                        'status': 'success',
                        'redirectUrl': f'{sso_logout_url}?redirect_uri={frontend_url}'
                    })
                
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
                    'email': data['email'],
                    'roles': data.get('roles', '')
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
            return jsonify({
                'message': 'Token valid!', 
                'user_id': token_data['user_id'],
                'email': token_data['email'],
                'roles': token_data.get('roles', '')
            })

    def run(self):
        self.app.run(debug=True)


if __name__ == '__main__':
    from flask import Flask
    app = Flask(__name__)
    auth_app = AuthApp(app)
    auth_app.run()