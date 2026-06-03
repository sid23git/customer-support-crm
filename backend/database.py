import sqlite3
import os
from dotenv import load_dotenv

# Load env configurations
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "./crm.db")

def get_db_connection():
    """
    Establish a connection to the SQLite database.
    Enables Row factory and foreign keys pragmas.
    """
    conn = sqlite3.connect(DATABASE_URL)
    conn.row_factory = sqlite3.Row
    # SQLite requires explicit activation of foreign key constraints
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    """
    Initialize SQLite database tables for support tickets and comments/notes.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create tickets table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT DEFAULT 'Open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # Create notes table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id TEXT NOT NULL,
        note_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
    );
    """)
    
    conn.commit()
    conn.close()
    print("Database tables initialized successfully.")
