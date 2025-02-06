from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import sqlite3
import base64
import json
from datetime import datetime
import re

app = Flask(__name__)
CORS(app)

class Database:
    def __init__(self, db_name='api_keys.db'):
        self.db_name = db_name

    def get_connection(self):
        conn = sqlite3.connect(self.db_name)
        conn.row_factory = sqlite3.Row
        return conn

    def execute_query(self, query, params=()):
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(query, params)
            conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    def fetch_all(self, query, params=()):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        return rows

class APIKeyGenerator:
    @staticmethod
    def create_api_key():
        key = os.urandom(32)
        api_key = base64.b64encode(key).decode('utf-8')
        return f"openlit-{api_key}"

class APIKeyService:
    def __init__(self, db):
        self.db = db

    def validate_project_name(self, project):
        if not project or len(project) < 3 or len(project) > 50:
            return False
        return bool(re.match(r'^[A-Za-z0-9-_]+$', project))

    def validate_name(self, name):
        if not name or len(name) < 3 or len(name) > 50:
            return False
        return bool(re.match(r'^[A-Za-z0-9\s]+$', name))

    def name_exists(self, name):
        """Cek apakah nama sudah digunakan"""
        query = 'SELECT COUNT(*) as count FROM api_keys WHERE name = ? AND is_deleted = 0'
        result = self.db.fetch_all(query, (name,))
        return result[0]['count'] > 0

    def generate_api_key(self, name, project):
        if not self.validate_name(name):
            raise ValueError("Nama harus 3-50 karakter dan hanya boleh mengandung huruf, angka, dan spasi")
        
        if not self.validate_project_name(project):
            raise ValueError("Nama project harus 3-50 karakter dan hanya boleh mengandung huruf, angka, - dan _")

        # Cek apakah nama sudah digunakan
        if self.name_exists(name):
            raise ValueError("Nama sudah digunakan, silakan pilih nama lain")

        api_key = APIKeyGenerator.create_api_key()

        try:
            query = '''
            INSERT INTO api_keys (name, api_key, project, created_at)
            VALUES (?, ?, ?, datetime('now'))
            '''
            self.db.execute_query(query, (name, api_key, project))
            return api_key
        except sqlite3.IntegrityError:
            raise ValueError("Terjadi kesalahan saat menyimpan data")

    def get_api_key_info(self, api_key):
        query = 'SELECT * FROM api_keys WHERE api_key = ? AND is_deleted = 0'
        result = self.db.fetch_all(query, (api_key,))
        if result:
            return result[0]
        return None

    def get_all_api_keys(self):
        query = 'SELECT * FROM api_keys WHERE is_deleted = 0 ORDER BY created_at DESC'
        return self.db.fetch_all(query)

    def delete_api_key(self, name):
        # Periksa apakah nama ada
        check_query = 'SELECT COUNT(*) as count FROM api_keys WHERE name = ? AND is_deleted = 0'
        result = self.db.fetch_all(check_query, (name,))
        
        if result[0]['count'] == 0:
            raise ValueError("API key dengan nama tersebut tidak ditemukan atau sudah dihapus")

        query = '''
        UPDATE api_keys 
        SET is_deleted = 1,
            deleted_at = datetime('now')
        WHERE name = ? AND is_deleted = 0
        '''
        self.db.execute_query(query, (name,))

def init_db():
    db = Database()
    query = '''
    CREATE TABLE IF NOT EXISTS api_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        api_key TEXT NOT NULL UNIQUE,
        project TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        deleted_at TIMESTAMP,
        is_deleted INTEGER DEFAULT 0,
        CONSTRAINT valid_name CHECK (length(name) >= 3 AND length(name) <= 50),
        CONSTRAINT valid_project CHECK (length(project) >= 3 AND length(project) <= 50)
    )
    '''
    db.execute_query(query)

@app.route('/generate_api_key', methods=['POST'])
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
        api_key_service = APIKeyService(db)

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
        return jsonify({'error': 'Terjadi kesalahan sistem'}), 500

@app.route('/get_api_key_info', methods=['GET'])
def get_api_key_info():
    try:
        api_key = request.args.get('api_key')
        if not api_key:
            return jsonify({'error': 'API key harus diisi'}), 400

        db = Database()
        api_key_service = APIKeyService(db)

        result = api_key_service.get_api_key_info(api_key)
        
        if not result:
            return jsonify({'error': 'API key tidak ditemukan'}), 404

        return jsonify({
            'id': result['id'],
            'name': result['name'],
            'api_key': result['api_key'],
            'project': result['project'],
            'created_at': result['created_at']
        })

    except Exception as e:
        return jsonify({'error': 'Terjadi kesalahan sistem'}), 500

@app.route('/get_all_api_keys', methods=['GET'])
def get_all_api_keys():
    try:
        db = Database()
        api_key_service = APIKeyService(db)

        keys = api_key_service.get_all_api_keys()

        return jsonify([{
            'id': row['id'],
            'name': row['name'],
            'api_key': row['api_key'],
            'project': row['project'],
            'created_at': row['created_at']
        } for row in keys])

    except Exception as e:
        return jsonify({'error': 'Terjadi kesalahan sistem'}), 500

@app.route('/delete_api_key', methods=['DELETE'])
def delete_api_key():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Data tidak ditemukan'}), 400
            
        name = data.get('name')
        if not name:
            return jsonify({'error': 'Nama harus diisi'}), 400

        db = Database()
        api_key_service = APIKeyService(db)

        api_key_service.delete_api_key(name)
        return jsonify({'message': f'API key untuk nama {name} berhasil dihapus'})

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        print(f"Error: {str(e)}")  # Untuk debugging
        return jsonify({'error': 'Terjadi kesalahan sistem'}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True)