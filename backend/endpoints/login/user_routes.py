from flask_restful import Resource
from flask import request, jsonify

class UserRoutes(Resource):
    def __init__(self, user_manager):
        self.user_manager = user_manager

    def get(self, sso_id=None):
        if sso_id:
            user = self.user_manager.get_user_by_sso_id(sso_id)
            if user:
                return dict(user)
            return {'message': 'User tidak ditemukan!'}, 404
        else:
            users = self.user_manager.get_all_users()
            return users

    def put(self, sso_id):
        data = request.get_json()
        if not data:
            return {'message': 'Data tidak valid!'}, 400
        
        user = self.user_manager.get_user_by_sso_id(sso_id)
        if not user:
            return {'message': 'User tidak ditemukan!'}, 404
        
        success = self.user_manager.update_user(sso_id, data)
        if success:
            return {'message': 'User berhasil diperbarui!'}
        return {'message': 'Gagal memperbarui user!'}, 500

    def delete(self, sso_id):
        user = self.user_manager.get_user_by_sso_id(sso_id)
        if not user:
            return {'message': 'User tidak ditemukan!'}, 404
        
        success = self.user_manager.delete_user(sso_id)
        if success:
            return {'message': 'User berhasil dihapus!'}
        return {'message': 'Gagal menghapus user!'}, 500

class UsersList(Resource):
    def __init__(self, user_manager):
        self.user_manager = user_manager
        
    def get(self):
        users = self.user_manager.get_all_users()
        return users
        
    def post(self):
        data = request.get_json()
        if not data or 'email' not in data or 'name' not in data or 'sso_id' not in data:
            return {'message': 'Data tidak lengkap!'}, 400
            
        existing_user = self.user_manager.get_user_by_sso_id(data.get('sso_id'))
        if existing_user:
            return {'message': 'ID sudah terdaftar!'}, 409
            
        existing_email = self.user_manager.get_user_by_email(data.get('email'))
        if existing_email:
            return {'message': 'Email sudah terdaftar!'}, 409
            
        new_user = self.user_manager.create_user({
            'name': data.get('name', ''),
            'email': data.get('email'),
            'sso_id': data.get('sso_id'),
            'role': data.get('role', 'user')
        })
        
        return {
            'message': 'User berhasil dibuat!',
            'user': dict(new_user)
        }, 201