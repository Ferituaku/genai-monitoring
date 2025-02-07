import sqlite3

class Database:
    def __init__(self, db_name="genaidb.db"):  # Pastikan __init__ dipanggil
        self.db_name = db_name

    def get_connection(self):
        conn = sqlite3.connect(self.db_name)
        conn.row_factory = sqlite3.Row  # Memastikan hasil query bisa diakses sebagai dictionary
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

# Pastikan objek Database dibuat dengan benar
db = Database()  # Tidak ada typo atau pemanggilan yang salah
