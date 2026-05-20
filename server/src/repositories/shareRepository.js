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
      'SELECT sh.* FROM shares sh JOIN snippets s ON sh.snippet_id = s.id WHERE sh.snippet_id = ? AND s.user_id = ? ORDER BY sh.created_at DESC'
    ).all(snippetId, userId);
  },

  async delete(shareId, snippetId, userId) {
    const db = getDb();
    return db.prepare('DELETE FROM shares WHERE id = ? AND snippet_id = ? AND snippet_id IN (SELECT id FROM snippets WHERE user_id = ?)').run(shareId, snippetId, userId);
  }
};

export default shareRepository;
