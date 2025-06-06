from db import Database

def create_tables():
    db = Database()
    conn = None
    try:
        conn = db.get_connection()
        cursor = conn.cursor()

        # Add pragmas for better concurrency
        cursor.execute('PRAGMA journal_mode=WAL')
        cursor.execute('PRAGMA busy_timeout=5000')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_keys (
            name TEXT NOT NULL,                    
            api_key TEXT NOT NULL UNIQUE PRIMARY KEY,
            project TEXT NOT NULL,          
            created_at TIMESTAMP NOT NULL,
            deleted_at TIMESTAMP,
            is_deleted INTEGER DEFAULT 0,
            CONSTRAINT valid_name CHECK (length(name) >= 3 AND length(name) <= 50),
            CONSTRAINT valid_project CHECK (length(project) >= 3 AND length(project) <= 50)
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS vault (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            api_key TEXT NOT NULL,
            created_by TEXT,
            project TEXT NOT NULL,
            value TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(api_key, project),
            FOREIGN KEY (api_key) REFERENCES api_keys(api_key),
            FOREIGN KEY (project) REFERENCES api_keys(project)
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            sso_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP 
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS logos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_name TEXT NOT NULL UNIQUE,
            logo_data BLOB,
            logo_filename TEXT,
            logo_mimetype TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT valid_project_name CHECK (length(project_name) >= 2 AND length(project_name) <= 100)
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS mlops (
            id TEXT PRIMARY KEY,
            project TEXT,
            filename TEXT,
            json_data TEXT,
            create_at DATETIME,
            status TEXT,
            complete_time DATETIME
        );
        ''')

        conn.commit()

    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    create_tables()
    print("Database dan tabel berhasil dibuat!")