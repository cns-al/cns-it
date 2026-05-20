import crypto from 'crypto';
import { getDb } from '../config/database.js';

const shareRepository = {
  async create(snippetId, userId, expiresAt = null) {
    const db = getDb();
    const token = crypto.randomBytes(16).toString('hex');
    db.prepare(
      'INSERT INTO shares (snippet_id, token, expires_at) VALUES (?, ?, ?)'
    ).run(snippetId, token, expiresAt);
    return token;
  },

  async getBySnippetId(snippetId, userId) {
    const db = getDb();
    return db.prepare(
      'SELECT * FROM shares WHERE snippet_id = ? ORDER BY created_at DESC'
    ).all(snippetId);
  },

  async delete(shareId, snippetId, userId) {
    const db = getDb();
    return db.prepare('DELETE FROM shares WHERE id = ? AND snippet_id = ?').run(shareId, snippetId);
  }
};

export default shareRepository;
