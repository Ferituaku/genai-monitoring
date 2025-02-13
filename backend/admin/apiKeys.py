from flask import Flask, jsonify, request,Blueprint
from flask_cors import CORS
import os
import base64
import re
from datetime import datetime
from backend.database.db import Database


apiKeys = Blueprint('apiKeys', __name__)  

class APIKeyGenerator:
    @staticmethod
    def create_api_key():
        key = os.urandom(32)
        return f"astra-{base64.b64encode(key).decode('utf-8')}"


class service:
    def __init__(self, db):
        self.db = db

    def validate_project_name(self, project):
        return bool(project and 3 <= len(project) <= 50 and re.match(r'^[A-Za-z0-9-_]+$', project))
    
    def validate_name(self, name):
        return bool(name and 3 <= len(name) <= 50 and re.match(r'^[A-Za-z0-9\s]+$', name))

    def project_exists(self, project):
        query = 'SELECT COUNT(*) FROM api_keys WHERE project = ? AND is_deleted = 0'
        result = self.db.fetch_one(query, (project,))
        return result[0] > 0 if result else False

    def generate_api_key(self, name, project):
        if not self.validate_name(name):
            raise ValueError("Nama harus 3-50 karakter dan hanya boleh mengandung huruf, angka, dan spasi")
        if not self.validate_project_name(project):
            raise ValueError("Nama project harus 3-50 karakter dan hanya boleh mengandung huruf, angka, - dan _")
        if self.project_exists(project):
            raise ValueError("Project api key sudah tersedia")

        api_key = APIKeyGenerator.create_api_key()

        try:
            query = '''
            INSERT INTO api_keys (name, api_key, project, created_at)
            VALUES (?, ?, ?, datetime('now'))
            '''
            self.db.execute_query(query, (name, api_key, project))
            return api_key
        except Exception as e:
            raise ValueError(f"Gagal membuat API key: {str(e)}")

    def get_api_key_info(self, api_key):
        query = 'SELECT * FROM api_keys WHERE api_key = ? AND is_deleted = 0'
        result = self.db.fetch_all(query, (api_key,))
        return result[0] if result else None

    def get_all_api_keys(self):
        return self.db.fetch_all('SELECT * FROM api_keys WHERE is_deleted = 0 ORDER BY created_at DESC')

    def delete_api_key(self, api_key):
        check_query = 'SELECT COUNT(*) FROM api_keys WHERE api_key = ? AND is_deleted = 0'
        result = self.db.fetch_one(check_query, (api_key,))
        if not result or result[0] == 0:
            raise ValueError("API key tidak ditemukan atau sudah dihapus")

        query = '''
        UPDATE api_keys SET is_deleted = 1, deleted_at = datetime('now') WHERE api_key = ?
        '''
        self.db.execute_query(query, (api_key,))

@apiKeys.route('/generate_api_key', methods=['POST'])
def generate_api_key():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Data tidak ditemukan'}), 400

        name = data.get('name')
        project = data.get('project')

        if not name or not project:
            return jsonify({'error': 'Name dan project harus diisi'}), 400

        db = Database()
        api_key_service = service(db)

        api_key = api_key_service.generate_api_key(name, project)

        return jsonify({
            'api_key': api_key,
            'name': name,
            'project': project,
            'created_at': datetime.now().isoformat()
        }), 201

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Terjadi kesalahan sistem: ' + str(e)}), 500


@apiKeys.route('/get_api_key_info', methods=['GET'])
def get_api_key_info():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Data tidak ditemukan'}), 400
            
        api_key = data.get('api_key')
        if not api_key:
            return jsonify({'error': 'Api key harus diisi'}), 400

        db = Database()
        api_key_service = service(db)

        result = api_key_service.get_api_key_info(api_key)
        
        if not result:
            return jsonify({'error': 'API key tidak ditemukan'}), 404

        return jsonify({
            'name': result['name'],
            'api_key': result['api_key'],
            'project': result['project'],
            'created_at': result['created_at']
        })

    except Exception as e:
        return jsonify({'error': 'Terjadi kesalahan sistem'}), 500

@apiKeys.route('/get_all_api_keys', methods=['GET'])
def get_all_api_keys():
    try:
        db = Database()
        api_key_service = service(db)

        keys = api_key_service.get_all_api_keys()

        return jsonify([{
            'name': row['name'],
            'api_key': row['api_key'],
            'project': row['project'],
            'created_at': row['created_at']
        } for row in keys])

    except Exception as e:
        return jsonify({'error': 'Terjadi kesalahan sistem'}), 500

@apiKeys.route('/delete_api_key', methods=['DELETE'])
def delete_api_key():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Data tidak ditemukan'}), 400
            
        api_key = data.get('api_key')
        if not api_key:
            return jsonify({'error': 'Api key harus diisi'}), 400

        db = Database()
        api_key_service = service(db)

        api_key_service.delete_api_key(api_key)
        return jsonify({'message': f'API key berhasil dihapus'})

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        print(f"Error: {str(e)}")  # Untuk debugging
        return jsonify({'error': 'Terjadi kesalahan sistem'}), 500
