from flask import request, jsonify, url_for, redirect, session
from flask_cors import CORS
from flask_session import Session
from authlib.integrations.flask_client import OAuth
import os
from dotenv import load_dotenv
from ..database.db import Database
from ..login.GoogleOAuth import GoogleOAuth
from ..login.UserManager import UserManager
from ..login.JWTManager import JWTManager


class AuthApp:
    def __init__(self,app):
        load_dotenv()
        self.app = app
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