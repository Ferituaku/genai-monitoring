from flask import Blueprint, jsonify, request
from datetime import datetime
import pytz
import sqlite3
import re
import os
from backend.login import JWTManager
from backend.database.db import Database

vault = Blueprint('vault', __name__)
wib = pytz.timezone('Asia/Jakarta')
db = Database()
jwt_manager = JWTManager(os.getenv('SECRET_KEY', 'your-secret-key'))

class Vault:
    def __init__(self, db):
        self.db = db    

    def validate_project(self, project):
        return bool(re.match(r'^[A-Za-z0-9-_]{3,50}$', project))

    def check_project_exists(self, project):
        query = '''SELECT COUNT(*) as count FROM api_keys WHERE project = ? AND is_deleted = 0'''
        result = self.db.fetch_one(query, (project,))
        return result and result['count'] > 0

    def check_api_key_exists(self, api_key):
        query = '''SELECT COUNT(*) as count FROM api_keys WHERE api_key = ? AND is_deleted = 0'''
        result = self.db.fetch_one(query, (api_key,))
        return result and result['count'] > 0

    def check_api_key_project_match(self, api_key, project):
        query = '''SELECT COUNT(*) as count FROM api_keys 
                  WHERE api_key = ? AND project = ? AND is_deleted = 0'''
        result = self.db.fetch_one(query, (api_key, project))
        return result and result['count'] > 0

    def check_vault_exists(self, api_key, project):
        query = '''SELECT COUNT(*) as count FROM vault WHERE api_key = ? AND project = ?'''
        result = self.db.fetch_one(query, (api_key, project))
        return result and result['count'] > 0

    def add_value(self, api_key, user_email, project, value):
        if not self.validate_project(project):
            raise ValueError("Project tidak valid")
        if not value:
            raise ValueError("Value tidak boleh kosong")
        if not self.check_project_exists(project):
            raise ValueError("Project tidak ditemukan di tabel api_keys")
        if not self.check_api_key_exists(api_key):
            raise ValueError("API Key tidak ditemukan di tabel api_keys")
        if not self.check_api_key_project_match(api_key, project):
            raise ValueError("API Key tidak sesuai dengan project yang diberikan")
        if self.check_vault_exists(api_key, project):
            raise ValueError("Vault dengan API Key dan Project ini sudah ada")

        query = '''INSERT INTO vault (api_key, created_by, project, value, created_at, last_updated) 
                  VALUES (?, ?, ?, ?, ?, ?)'''
        current_time = datetime.now(wib)
        self.db.execute_query(query, (
            api_key, 
            user_email, 
            project, 
            value, 
            current_time.strftime('%Y-%m-%d %H:%M:%S'),
            current_time.strftime('%Y-%m-%d %H:%M:%S')
        ))

@vault.route('/get_values', methods=['GET'])
@jwt_manager.token_required
def get_values(token_data):
    try:
        query = '''SELECT api_key, value, created_by, last_updated 
                  FROM vault'''
        rows = db.fetch_all(query)

        vaults = [
            {
                "key": row["api_key"],
                "value": row["value"],
                "createdBy": row["created_by"],
                "lastUpdatedOn": row["last_updated"]
            }
            for row in rows
        ]

        return jsonify(vaults), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@vault.route('/add_vault', methods=['POST'])
@jwt_manager.token_required
def add_vault(token_data):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Data tidak ditemukan'}), 400

        api_key = data.get('api_key')
        value = data.get('value')
        project = data.get('project')

        if not all([api_key, value, project]):
            return jsonify({'error': 'api_key, value, dan project wajib diisi'}), 400

        vault_instance = Vault(db)
        user_email = token_data.get('email')
        if not user_email:
            return jsonify({'error': 'Email tidak ditemukan dalam token'}), 401

        try:
            vault_instance.add_value(api_key, user_email, project, value)
        except sqlite3.IntegrityError:
            return jsonify({'error': 'Vault dengan API Key dan Project ini sudah ada'}), 400

        return jsonify({
            'api_key': api_key,
            'created_by': user_email,
            'value': value,
            'project': project,
            'created_at': datetime.now(wib).isoformat()
        }), 201

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@vault.route('/update_value', methods=['PUT'])
@jwt_manager.token_required
def update_value(token_data):
    try:
        data = request.get_json()
        api_key = data.get('api_key')
        new_value = data.get('value')

        if not api_key or not new_value:
            return jsonify({'error': 'api_key dan value harus diisi'}), 400

        current_time = datetime.now(wib)
        query = '''UPDATE vault 
                  SET value = ?, last_updated = ? 
                  WHERE api_key = ?'''
        db.execute_query(query, (
            new_value, 
            current_time.strftime('%Y-%m-%d %H:%M:%S'),
            api_key
        ))

        return jsonify({
            'message': 'Value berhasil diperbarui',
            'api_key': api_key,
            'new_value': new_value,
            'updated_at': current_time.isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@vault.route('/delete_value/<api_key>', methods=['DELETE'])
@jwt_manager.token_required
def delete_value(token_data, api_key):
    try:
        query = 'DELETE FROM vault WHERE api_key = ?'
        db.execute_query(query, (api_key,))

        return jsonify({
            'message': 'Value berhasil dihapus',
            'api_key': api_key,
            'deleted_at': datetime.now(wib).isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500