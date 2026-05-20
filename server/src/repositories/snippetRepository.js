import crypto from 'crypto';
import { getDb } from '../config/database.js';

const snippetRepository = {
  async create(title, description, userId, fragments, isPublic = false, categories = [], steps = []) {
    const db = getDb();
    const stmt = db.transaction(() => {
      const snippetResult = db.prepare(
        'INSERT INTO snippets (title, description, user_id, is_public) VALUES (?, ?, ?, ?)'
      ).run(title, description, userId, isPublic ? 1 : 0);

      const snippetId = snippetResult.lastInsertRowid;

      fragments.forEach((frag, i) => {
        db.prepare(
          'INSERT INTO fragments (snippet_id, file_name, code, language, position) VALUES (?, ?, ?, ?, ?)'
        ).run(snippetId, frag.name || `file${i + 1}`, frag.code, frag.language, i);
      });

      steps.forEach((step, i) => {
        db.prepare(
          'INSERT INTO steps (snippet_id, title, description, code, language, position) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(snippetId, step.title || `Step ${i + 1}`, step.description || '', step.code, step.language, i);
      });

      categories.forEach(catName => {
        let category = db.prepare('SELECT id FROM categories WHERE name = ? AND user_id = ?').get(catName, userId);
        if (!category) {
          const catResult = db.prepare('INSERT INTO categories (name, user_id) VALUES (?, ?)').run(catName, userId);
          category = { id: catResult.lastInsertRowid };
        }
        db.prepare('INSERT OR IGNORE INTO snippet_categories (snippet_id, category_id) VALUES (?, ?)').run(snippetId, category.id);
      });

      return snippetId;
    });

    const snippetId = stmt();
    return this.findById(snippetId, userId);
  },

  async findById(id, userId) {
    const db = getDb();
    const snippet = db.prepare(`
      SELECT s.*, u.username
      FROM snippets s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ? AND (s.user_id = ? OR s.is_public = 1)
    `).get(id, userId);

    if (!snippet) return null;

    snippet.fragments = db.prepare('SELECT * FROM fragments WHERE snippet_id = ? ORDER BY position').all(id);
    snippet.steps = db.prepare('SELECT * FROM steps WHERE snippet_id = ? ORDER BY position').all(id);
    snippet.categories = db.prepare(`
      SELECT c.name FROM categories c
      JOIN snippet_categories sc ON c.id = sc.category_id
      WHERE sc.snippet_id = ?
    `).all(id).map(r => r.name);

    return snippet;
  },

  async getUserSnippets(userId, offset = 0, limit = 50, search = '', language = '', sortBy = 'newest', category = '') {
    const db = getDb();

    let query = `
      SELECT s.*, u.username,
        (SELECT COUNT(*) FROM fragments WHERE snippet_id = s.id) as fragment_count,
        (SELECT COUNT(*) FROM steps WHERE snippet_id = s.id) as step_count,
        (SELECT GROUP_CONCAT(c.name, ',') FROM snippet_categories sc JOIN categories c ON sc.category_id = c.id WHERE sc.snippet_id = s.id) as categories
      FROM snippets s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = ? AND s.expiry_date IS NULL
    `;
    const params = [userId];

    if (search) {
      query += ' AND (s.title LIKE ? OR s.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (language) {
      query += ' AND s.id IN (SELECT DISTINCT snippet_id FROM fragments WHERE language = ?)';
      params.push(language);
    }

    if (category) {
      query += ' AND s.id IN (SELECT sc.snippet_id FROM snippet_categories sc JOIN categories c ON sc.category_id = c.id WHERE c.name = ?)';
      params.push(category);
    }

    const sortMap = {
      newest: 's.updated_at DESC',
      oldest: 's.updated_at ASC',
      alpha: 's.title ASC',
      reverseAlpha: 's.title DESC'
    };
    query += ` ORDER BY ${sortMap[sortBy] || sortMap.newest} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const snippets = db.prepare(query).all(...params);
    const total = db.prepare(query.replace(/ORDER BY.*$/, 'LIMIT -1 OFFSET -1').replace(/LIMIT \? OFFSET \?/, '')).all(...params.slice(0, -2)).length;

    return { data: snippets, total };
  },

  async update(id, userId, updates) {
    const db = getDb();
    const stmt = db.transaction(() => {
      if (updates.title !== undefined) {
        db.prepare('UPDATE snippets SET title = ? WHERE id = ? AND user_id = ?').run(updates.title, id, userId);
      }
      if (updates.description !== undefined) {
        db.prepare('UPDATE snippets SET description = ? WHERE id = ? AND user_id = ?').run(updates.description, id, userId);
      }
      if (updates.isPublic !== undefined) {
        db.prepare('UPDATE snippets SET is_public = ? WHERE id = ? AND user_id = ?').run(updates.isPublic ? 1 : 0, id, userId);
      }
      if (updates.isPinned !== undefined) {
        db.prepare('UPDATE snippets SET is_pinned = ? WHERE id = ? AND user_id = ?').run(updates.isPinned ? 1 : 0, id, userId);
      }
      if (updates.isFavorite !== undefined) {
        db.prepare('UPDATE snippets SET is_favorite = ? WHERE id = ? AND user_id = ?').run(updates.isFavorite ? 1 : 0, id, userId);
      }

      if (updates.fragments !== undefined) {
        db.prepare('DELETE FROM fragments WHERE snippet_id = ?').run(id);
        updates.fragments.forEach((frag, i) => {
          db.prepare(
            'INSERT INTO fragments (snippet_id, file_name, code, language, position) VALUES (?, ?, ?, ?, ?)'
          ).run(id, frag.name || `file${i + 1}`, frag.code, frag.language, i);
        });
      }

      if (updates.steps !== undefined) {
        db.prepare('DELETE FROM steps WHERE snippet_id = ?').run(id);
        updates.steps.forEach((step, i) => {
          db.prepare(
            'INSERT INTO steps (snippet_id, title, description, code, language, position) VALUES (?, ?, ?, ?, ?, ?)'
          ).run(id, step.title || `Step ${i + 1}`, step.description || '', step.code, step.language, i);
        });
      }

      if (updates.categories !== undefined) {
        db.prepare('DELETE FROM snippet_categories WHERE snippet_id = ?').run(id);
        updates.categories.forEach(catName => {
          let category = db.prepare('SELECT id FROM categories WHERE name = ? AND user_id = ?').get(catName, userId);
          if (!category) {
            const catResult = db.prepare('INSERT INTO categories (name, user_id) VALUES (?, ?)').run(catName, userId);
            category = { id: catResult.lastInsertRowid };
          }
          db.prepare('INSERT OR IGNORE INTO snippet_categories (snippet_id, category_id) VALUES (?, ?)').run(id, category.id);
        });
      }

      db.prepare('UPDATE snippets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    });

    stmt();
    return this.findById(id, userId);
  },

  async softDelete(id, userId) {
    const db = getDb();
    return db.prepare('UPDATE snippets SET expiry_date = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?').run(id, userId);
  },

  async restore(id, userId) {
    const db = getDb();
    return db.prepare('UPDATE snippets SET expiry_date = NULL WHERE id = ? AND user_id = ?').run(id, userId);
  },

  async permanentDelete(id, userId) {
    const db = getDb();
    return db.prepare('DELETE FROM snippets WHERE id = ? AND user_id = ?').run(id, userId);
  },

  async getRecycleBin(userId, offset = 0, limit = 50) {
    const db = getDb();
    return db.prepare(`
      SELECT s.*, u.username
      FROM snippets s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = ? AND s.expiry_date IS NOT NULL
      ORDER BY s.expiry_date DESC
      LIMIT ? OFFSET ?
    `).all(userId, limit, offset);
  },

  async getCategories(userId) {
    const db = getDb();
    return db.prepare(`
      SELECT c.*, COUNT(sc.snippet_id) as snippet_count
      FROM categories c
      LEFT JOIN snippet_categories sc ON c.id = sc.category_id
      WHERE c.user_id = ?
      GROUP BY c.id
      ORDER BY c.name
    `).all(userId);
  },

  async getPublicSnippets(offset = 0, limit = 50, search = '') {
    const db = getDb();
    let query = `
      SELECT s.*, u.username,
        (SELECT COUNT(*) FROM fragments WHERE snippet_id = s.id) as fragment_count
      FROM snippets s
      JOIN users u ON s.user_id = u.id
      WHERE s.is_public = 1 AND s.expiry_date IS NULL
    `;
    const params = [];

    if (search) {
      query += ' AND (s.title LIKE ? OR s.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY s.updated_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return db.prepare(query).all(...params);
  },

  async getSnippetByShareToken(token) {
    const db = getDb();
    const share = db.prepare(`
      SELECT s.*, u.username
      FROM shares sh
      JOIN snippets s ON sh.snippet_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE sh.token = ? AND (sh.expires_at IS NULL OR sh.expires_at > CURRENT_TIMESTAMP)
    `).get(token);

    if (!share) return null;

    db.prepare('UPDATE shares SET view_count = view_count + 1 WHERE token = ?').run(token);
    share.fragments = db.prepare('SELECT * FROM fragments WHERE snippet_id = ? ORDER BY position').all(share.id);
    share.steps = db.prepare('SELECT * FROM steps WHERE snippet_id = ? ORDER BY position').all(share.id);
    return share;
  }
};

export default snippetRepository;
