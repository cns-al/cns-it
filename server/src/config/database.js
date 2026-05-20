import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Logger from '../logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = process.env.DATA_DIR || path.join(__dirname, '../../../data');
const dbPath = path.join(dataDir, 'snippets.db');

let db = null;

export function initializeDatabase() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      email TEXT,
      name TEXT,
      oidc_id TEXT,
      oidc_provider TEXT,
      is_admin INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      is_approved INTEGER DEFAULT 1,
      last_login DATETIME
    );

    CREATE TABLE IF NOT EXISTS snippets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      user_id INTEGER NOT NULL,
      is_public INTEGER DEFAULT 0,
      is_pinned INTEGER DEFAULT 0,
      is_favorite INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expiry_date DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS fragments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      snippet_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      code TEXT NOT NULL,
      language TEXT,
      position INTEGER DEFAULT 0,
      FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      snippet_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      code TEXT NOT NULL,
      language TEXT,
      position INTEGER DEFAULT 0,
      FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS snippet_categories (
      snippet_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      PRIMARY KEY (snippet_id, category_id),
      FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key_hash TEXT NOT NULL,
      key_prefix TEXT NOT NULL,
      name TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_used DATETIME,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS shares (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      snippet_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      view_count INTEGER DEFAULT 0,
      FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS diagrams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT 'Untitled Diagram',
      xml_data TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_snippets_user_id ON snippets(user_id);
    CREATE INDEX IF NOT EXISTS idx_snippets_user_expiry ON snippets(user_id, expiry_date);
    CREATE INDEX IF NOT EXISTS idx_snippets_is_public ON snippets(is_public);
    CREATE INDEX IF NOT EXISTS idx_snippets_public_expiry ON snippets(is_public, expiry_date);
    CREATE INDEX IF NOT EXISTS idx_diagrams_user_id ON diagrams(user_id);
    CREATE INDEX IF NOT EXISTS idx_fragments_snippet_id ON fragments(snippet_id);
    CREATE INDEX IF NOT EXISTS idx_fragments_snippet_language ON fragments(snippet_id, language);
    CREATE INDEX IF NOT EXISTS idx_steps_snippet_id ON steps(snippet_id);
    CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
    CREATE INDEX IF NOT EXISTS idx_categories_name_user ON categories(name, user_id);
    CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
    CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
    CREATE INDEX IF NOT EXISTS idx_shares_token ON shares(token);
    CREATE INDEX IF NOT EXISTS idx_shares_snippet ON shares(snippet_id);
  `);

  // Migration: add is_approved column if it doesn't exist
  try {
    db.exec('ALTER TABLE users ADD COLUMN is_approved INTEGER DEFAULT 1');
  } catch {
    // Column already exists
  }

  // Migration: ensure first user is admin
  try {
    const firstUser = db.prepare('SELECT id FROM users ORDER BY id ASC LIMIT 1').get();
    if (firstUser) {
      db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(firstUser.id);
      Logger.info('Ensured first user (id=' + firstUser.id + ') is admin');
    }
  } catch (err) {
    Logger.error('Migration error:', err);
  }

  Logger.info('Database initialized at ' + dbPath);
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

export function shutdownDatabase() {
  if (db) {
    db.close();
    db = null;
    Logger.info('Database connection closed');
  }
}
