import sqlite3
import os

class Database:
    def __init__(self, db_name="genaidb.db"):
        self.db_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "database"))
        os.makedirs(self.db_folder, exist_ok=True)
        self.db_path = os.path.join(self.db_folder, db_name)

    def get_connection(self):
        conn = sqlite3.connect(self.db_path, timeout=30)  # Add timeout
        conn.execute('PRAGMA journal_mode=WAL')  # Use WAL mode
        conn.execute('PRAGMA busy_timeout=5000')  # Set busy timeout
        conn.row_factory = sqlite3.Row
        return conn

    def execute_query(self, query, params=()):
        conn = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(query, params)
            conn.commit()
        finally:
            if conn:
                conn.close()

    def fetch_one(self, query, params=()):
        conn = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(query, params)
            return cursor.fetchone()
        finally:
            if conn:
                conn.close()

    def fetch_all(self, query, params=()):
        conn = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(query, params)
            results = cursor.fetchall()
            return [dict(row) for row in results] if results else []
        finally:
            if conn:
                conn.close()

# Single instance
db = Database()