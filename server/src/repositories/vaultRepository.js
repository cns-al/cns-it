import { getDb } from '../config/database.js';

export default {
  async findAll(userId) {
    const db = getDb();
    return db.prepare(
      'SELECT id, name, type, host, username, encrypted_value, iv, auth_tag, notes, created_at, updated_at FROM vault_entries WHERE user_id = ? ORDER BY updated_at DESC'
    ).all(userId);
  },

  async findById(id, userId) {
    const db = getDb();
    return db.prepare(
      'SELECT id, name, type, host, username, encrypted_value, iv, auth_tag, notes, created_at, updated_at FROM vault_entries WHERE id = ? AND user_id = ?'
    ).get(id, userId);
  },

  async create(name, type, encryptedValue, iv, authTag, userId, host, username, notes) {
    const db = getDb();
    const result = db.prepare(
      'INSERT INTO vault_entries (name, type, host, username, encrypted_value, iv, auth_tag, notes, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(name, type, host || null, username || null, encryptedValue, iv, authTag, notes || null, userId);
    return this.findById(result.lastInsertRowid, userId);
  },

  async update(id, userId, name, type, encryptedValue, iv, authTag, host, username, notes) {
    const db = getDb();
    const existing = this.findById(id, userId);
    if (!existing) return null;
    db.prepare(
      'UPDATE vault_entries SET name = ?, type = ?, host = ?, username = ?, encrypted_value = ?, iv = ?, auth_tag = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(name, type, host || null, username || null, encryptedValue, iv, authTag, notes || null, id);
    return this.findById(id, userId);
  },

  async delete(id, userId) {
    const db = getDb();
    const existing = this.findById(id, userId);
    if (!existing) return false;
    db.prepare('DELETE FROM vault_entries WHERE id = ?').run(id);
    return true;
  },

  async decryptValue(id, userId, masterKey) {
    const entry = await this.findById(id, userId);
    if (!entry) return null;
    const crypto = await import('../utils/vaultCrypto.js');
    return crypto.decrypt(entry.encrypted_value, entry.iv, entry.auth_tag, masterKey);
  },

  async search(userId, query) {
    const db = getDb();
    return db.prepare(
      'SELECT id, name, type, host, username, encrypted_value, iv, auth_tag, notes, created_at, updated_at FROM vault_entries WHERE user_id = ? AND (name LIKE ? OR host LIKE ? OR username LIKE ? OR notes LIKE ?) ORDER BY updated_at DESC'
    ).all(userId, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);
  }
};
