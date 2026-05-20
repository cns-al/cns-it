import crypto from 'crypto';
import { getDb } from '../config/database.js';
import Logger from '../logger.js';

const userRepository = {
  async findByUsername(username) {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  },

  async findById(id) {
    const db = getDb();
    return db.prepare('SELECT id, username, created_at, email, name, is_admin, is_active FROM users WHERE id = ?').get(id);
  },

  async findByOIDCId(oidcId, provider) {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE oidc_id = ? AND oidc_provider = ?').get(oidcId, provider);
  },

  async create(username, passwordHash, skipApproval = false) {
    const db = getDb();
    const result = db.prepare(
      'INSERT INTO users (username, password_hash, is_approved) VALUES (?, ?, ?)'
    ).run(username, passwordHash, skipApproval ? 1 : 0);
    return this.findById(result.lastInsertRowid);
  },

  async createAnonymousUser(username) {
    const db = getDb();
    const result = db.prepare('INSERT INTO users (username) VALUES (?)').run(username);
    return this.findById(result.lastInsertRowid);
  },

  async createOIDCUser(username, oidcId, provider, email, name) {
    const db = getDb();
    const result = db.prepare(
      'INSERT INTO users (username, oidc_id, oidc_provider, email, name) VALUES (?, ?, ?, ?, ?)'
    ).run(username, oidcId, provider, email, name);
    return this.findById(result.lastInsertRowid);
  },

  async updateLastLogin(userId) {
    const db = getDb();
    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(userId);
  },

  async updatePassword(userId, newHash) {
    const db = getDb();
    return db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, userId);
  },

  async findOrCreateOIDCUser(userInfo, issuer) {
    let user = await this.findByOIDCId(userInfo.sub, issuer);

    if (!user) {
      const username = userInfo.preferred_username || userInfo.email?.split('@')[0] || `oidc-${userInfo.sub}`;
      user = await this.createOIDCUser(username, userInfo.sub, issuer, userInfo.email, userInfo.name);
    }

    await this.updateLastLogin(user.id);
    return user;
  },

  async deactivate(userId) {
    const db = getDb();
    return db.prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(userId);
  },

  async activate(userId) {
    const db = getDb();
    return db.prepare('UPDATE users SET is_active = 1 WHERE id = ?').run(userId);
  },

  async makeAdmin(userId) {
    const db = getDb();
    return db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(userId);
  },

  async demote(userId) {
    const db = getDb();
    return db.prepare('UPDATE users SET is_admin = 0 WHERE id = ?').run(userId);
  },

  async getAll() {
    const db = getDb();
    return db.prepare('SELECT id, username, created_at, email, name, is_admin, is_active, last_login FROM users ORDER BY created_at DESC').all();
  },

  async count() {
    const db = getDb();
    return db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  },

  async approve(userId) {
    const db = getDb();
    return db.prepare('UPDATE users SET is_approved = 1 WHERE id = ?').run(userId);
  },

  async reject(userId) {
    const db = getDb();
    return db.prepare('DELETE FROM users WHERE id = ? AND is_approved = 0').run(userId);
  },

  async getPending() {
    const db = getDb();
    return db.prepare(
      'SELECT id, username, created_at, email, name, is_admin, is_active, is_approved FROM users WHERE is_approved = 0 ORDER BY created_at DESC'
    ).all();
  },

  async getAllWithApproval() {
    const db = getDb();
    return db.prepare(
      'SELECT id, username, created_at, email, name, is_admin, is_active, is_approved, last_login FROM users ORDER BY created_at DESC'
    ).all();
  },

  async deleteUser(userId) {
    const db = getDb();
    return db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  },

  async countAdmins() {
    const db = getDb();
    return db.prepare('SELECT COUNT(*) as count FROM users WHERE is_admin = 1').get().count;
  }
};

export default userRepository;
