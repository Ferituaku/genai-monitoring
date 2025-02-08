from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import re
from datetime import datetime
from db import Database

app = Flask(__name__)
CORS(app)

db = Database()

class Vault:
    def __init__(self, db):
        self.db = db

    def validate_project(self, project):
        return bool(re.match(r'^[A-Za-z0-9-_]{3,50}$', project))

    def validate_name(self, name):
        return bool(re.match(r'^[A-Za-z0-9\s]{3,50}$', name))

    # def validate_api_key(self, api_key):
    #     return bool(re.match(r'^[A-Za-z0-9-_]{32}$', api_key))

    def check_project_and_key(self, api_key, project):
        query = '''SELECT COUNT(*) as count FROM api_keys WHERE api_key = ? AND project = ? AND is_deleted = 0'''
        result = self.db.fetch_one(query, (api_key, project))
        return result and result['count'] > 0

    def add_value(self, api_key, created_by, project, value):
        # if not self.validate_api_key(api_key):
        #     raise ValueError("API Key tidak valid")
        if not self.validate_project(project):
            raise ValueError("Project tidak valid")
        if not value:
            raise ValueError("Value tidak boleh kosong")
        if not self.check_project_and_key(api_key, project):
            raise ValueError("API Key atau project tidak valid atau sudah dihapus")

        query = '''INSERT INTO vault (api_key, created_by, project, value, created_at, last_updated) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))'''
        self.db.execute_query(query, (api_key, created_by, project, value))

@app.route('/add_vault', methods=['POST'])
def add_vault():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Data tidak ditemukan'}), 400

        api_key = data.get('api_key')
        value = data.get('value')
        created_by = data.get('created_by')

        if not api_key or not value or not created_by:
            return jsonify({'error': 'api_key, created_by, dan value wajib diisi'}), 400

        # Ambil project berdasarkan api_key
        query = "SELECT project FROM api_keys WHERE api_key = ? AND is_deleted = 0"
        result = db.fetch_one(query, (api_key,))  # Pastikan ini mengembalikan dictionary

        if not result:
            return jsonify({'error': 'api_key tidak ditemukan'}), 404

        project = result["project"]  # Ambil nilai project dari dictionary

        # Simpan ke vault
        vault = Vault(db)
        vault.add_value(api_key, created_by, project, value)

        return jsonify({
            'api_key': api_key,
            'created_by': created_by,
            'value': value,
            'project': project,  # project diambil dari database
            'created_at': datetime.now().isoformat()
        }), 201

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Terjadi kesalahan sistem: ' + str(e)}), 500


@app.route('/get_value/<api_key>', methods=['GET'])
def get_value(api_key):
    try:
        query = 'SELECT value, created_at FROM vault WHERE api_key = ? AND is_deleted = 0'
        row = db.fetch_one(query, (api_key,))
        
        if not row:
            return jsonify({'error': 'Value tidak ditemukan'}), 404
        
        return jsonify({'api_key': api_key, 'value': row['value'], 'created_at': row['created_at']})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_values', methods=['GET'])
def get_values():
    try:
        query = 'SELECT api_key, value, created_by, last_updated FROM vault WHERE is_deleted = 0'
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


@app.route('/update_value', methods=['PUT'])
def update_value():
    try:
        data = request.get_json()
        api_key = data.get('api_key')
        new_value = data.get('value')

        if not api_key or not new_value:
            return jsonify({'error': 'api_key dan value harus diisi'}), 400

        query = '''UPDATE vault SET value = ?, last_updated = datetime('now') WHERE api_key = ? AND is_deleted = 0'''
        db.execute_query(query, (new_value, api_key))

        return jsonify({'message': 'Value berhasil diperbarui', 'api_key': api_key, 'new_value': new_value})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete_value/<api_key>', methods=['DELETE'])
def delete_value(api_key):
    try:
        query = '''UPDATE vault SET is_deleted = 1, deleted_at = datetime('now') WHERE api_key = ?'''
        db.execute_query(query, (api_key,))

        return jsonify({'message': 'Value berhasil dihapus', 'api_key': api_key})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
