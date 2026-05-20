import { getDb } from '../config/database.js';

export function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

export function isAdmin(userId) {
  try {
    const db = getDb();
    const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(userId);
    return user && user.is_admin === 1;
  } catch (error) {
    return false;
  }
}
