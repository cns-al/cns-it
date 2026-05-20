import crypto from 'crypto';
import { getDb } from '../config/database.js';

const apiKeyRepository = {
  async create(name, userId) {
    const db = getDb();
    const key = crypto.randomBytes(32).toString('hex');
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    const keyPrefix = key.substring(0, 8);

    const result = db.prepare(
      'INSERT INTO api_keys (key_hash, key_prefix, name, user_id) VALUES (?, ?, ?, ?)'
    ).run(keyHash, keyPrefix, name, userId);

    return { id: result.lastInsertRowid, key, prefix: keyPrefix, name };
  },

  async getByUserId(userId) {
    const db = getDb();
    return db.prepare(
      'SELECT id, key_prefix, name, created_at, last_used, is_active FROM api_keys WHERE user_id = ? ORDER BY created_at DESC'
    ).all(userId);
  },

  async deactivate(keyId, userId) {
    const db = getDb();
    return db.prepare('UPDATE api_keys SET is_active = 0 WHERE id = ? AND user_id = ?').run(keyId, userId);
  },

  async delete(keyId, userId) {
    const db = getDb();
    return db.prepare('DELETE FROM api_keys WHERE id = ? AND user_id = ?').run(keyId, userId);
  },

  validateApiKey(key) {
    const db = getDb();
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    const apikey = db.prepare('SELECT * FROM api_keys WHERE key_hash = ? AND is_active = 1').get(keyHash);

    if (!apikey) return null;

    db.prepare('UPDATE api_keys SET last_used = CURRENT_TIMESTAMP WHERE id = ?').run(apikey.id);
    return { userId: apikey.user_id, keyId: apikey.id };
  }
};

export default apiKeyRepository;
export const validateApiKey = apiKeyRepository.validateApiKey;
