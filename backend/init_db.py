from db import Database

def create_tables():
    db = Database()
    conn = db.get_connection()
    cursor = conn.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS api_keys (
        name TEXT NOT NULL UNIQUE,
        api_key TEXT NOT NULL UNIQUE PRIMARY KEY,
        project TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL,
        deleted_at TIMESTAMP,
        is_deleted INTEGER DEFAULT 0,
        CONSTRAINT valid_name CHECK (length(name) >= 3 AND length(name) <= 50),
        CONSTRAINT valid_project CHECK (length(project) >= 3 AND length(project) <= 50)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS vault (
        api_key TEXT NOT NULL,
        created_by TEXT,
        project TEXT NOT NULL,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        is_deleted INTEGER DEFAULT 0,
        FOREIGN KEY (api_key) REFERENCES api_keys(api_key),
        FOREIGN KEY (project) REFERENCES api_keys(project)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        google_id TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        name TEXT,
        avatar_url TEXT
    )
    ''')

    conn.commit()
    conn.close()

if __name__ == "__main__":
    create_tables()
    print("Database dan tabel berhasil dibuat!")