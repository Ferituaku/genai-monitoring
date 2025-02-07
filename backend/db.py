import sqlite3
import os

class Database:
    def __init__(self, db_name="genaidb.db"):
        # Path lengkap ke folder database
        self.db_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "database"))

        # Buat folder database jika belum ada
        os.makedirs(self.db_folder, exist_ok=True)

        # Path lengkap ke file database
        self.db_path = os.path.join(self.db_folder, db_name)

    def get_connection(self):
        # Gunakan path absolut agar SQLite bisa menemukan file
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def execute_query(self, query, params=()):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        conn.commit()
        conn.close()

    def fetch_one(self, query, params=()):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        result = cursor.fetchone()
        conn.close()
        return result

    def fetch_all(self, query, params=()):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        results = cursor.fetchall()
        conn.close()
        return [dict(row) for row in results] if results else []

# Buat objek database
db = Database()
