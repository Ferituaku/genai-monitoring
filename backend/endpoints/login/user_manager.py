from datetime import datetime
import pytz
from data.configuration.db import db

# Gunakan timezone WIB
wib = pytz.timezone('Asia/Jakarta')

class UserManager:
    def __init__(self):
        self.db = db

    def get_user_by_email(self, email):
        return self.db.fetch_one('SELECT * FROM users WHERE email = ?', (email,))

    def get_user_by_sso_id(self, sso_id):
        return self.db.fetch_one('SELECT * FROM users WHERE sso_id = ?', (sso_id,))
    
    def get_all_users(self):
        return self.db.fetch_all('SELECT sso_id, name, email, role, created_at, last_login FROM users')

    def update_user(self, sso_id, user_data):
        query = '''
            UPDATE users 
            SET name = ?,
                role = ?
            WHERE sso_id = ?
        '''
        self.db.execute_query(query, (
            user_data.get('name', ''),
            user_data.get('role', 'user'),
            sso_id
        ))
        return True
        
    def update_last_login(self, sso_id):
        query = '''
            UPDATE users 
            SET last_login = ? 
            WHERE sso_id = ?
        '''
        self.db.execute_query(query, (
            datetime.now(wib),
            sso_id
        ))
        return True
    
    def create_user(self, user_data):
        query = '''
            INSERT INTO users (sso_id, name, email, role, last_login)
            VALUES (?, ?, ?, ?, ?)
        '''
        self.db.execute_query(query, (
            user_data.get('sso_id'),
            user_data.get('name', ''),
            user_data.get('email'),
            user_data.get('role', 'user'),
            datetime.now(wib)
        ))
        return self.get_user_by_sso_id(user_data.get('sso_id'))
    
    def delete_user(self, sso_id):
        query = 'DELETE FROM users WHERE sso_id = ?'
        self.db.execute_query(query, (sso_id,))
        return True
