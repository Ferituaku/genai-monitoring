# from datetime import datetime
# from ..database.db import Database

# class UserManager:
#     def __init__(self, db):
#         self.db = db

#     def get_user_by_email(self, email):
#         return self.db.fetch_one('SELECT * FROM users WHERE email = ?', (email,))

#     def get_user_by_id(self, user_id):
#         return self.db.fetch_one('SELECT * FROM users WHERE id = ?', (user_id,))

#     def update_user(self, email, user_data):
#         query = '''
#             UPDATE users 
#             SET google_id = ?, name = ?, avatar_url = ?, last_login = ? 
#             WHERE email = ?
#         '''
#         self.db.execute_query(query, (
#             user_data.get('sub'),
#             user_data.get('name', ''),
#             user_data.get('picture', ''),
#             datetime.utcnow(),
#             email
#         ))

#     def create_user(self, user_data):
#         query = '''
#             INSERT INTO users (email, google_id, name, avatar_url, last_login)
#             VALUES (?, ?, ?, ?, ?)
#         '''
#         self.db.execute_query(query, (
#             user_data.get('email'),
#             user_data.get('sub'),
#             user_data.get('name', ''),
#             user_data.get('picture', ''),
#             datetime.utcnow()
#         ))
#         return self.get_user_by_email(user_data.get('email'))
