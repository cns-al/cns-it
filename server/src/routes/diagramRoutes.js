import express from 'express';
import { getDb } from '../config/database.js';
import Logger from '../logger.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = express.Router();
const diagramLimiter = rateLimit({ max: 30, windowMs: 60_000 });

// GET /api/diagrams - list user's diagrams
router.get('/', diagramLimiter, async (req, res) => {
  try {
    const db = getDb();
    const { limit = 20, offset = 0 } = req.query;
    const diagrams = db.prepare(
      'SELECT id, title, created_at, updated_at FROM diagrams WHERE user_id = ? ORDER BY updated_at DESC LIMIT ? OFFSET ?'
    ).all(req.user.id, parseInt(limit), parseInt(offset));
    const total = db.prepare(
      'SELECT COUNT(*) as count FROM diagrams WHERE user_id = ?'
    ).get(req.user.id).count;
    res.json({ data: diagrams, total });
  } catch (error) {
    Logger.error('Get diagrams error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/diagrams - create new diagram
router.post('/', diagramLimiter, async (req, res) => {
  try {
    const db = getDb();
    const { title, xml_data } = req.body;
    if (!xml_data) {
      return res.status(400).json({ error: 'Diagram data required' });
    }
    if (typeof xml_data === 'string' && xml_data.length > 5_000_000) {
      return res.status(413).json({ error: 'Diagram XML too large (max 5MB)' });
    }
    const result = db.prepare(
      'INSERT INTO diagrams (title, xml_data, user_id) VALUES (?, ?, ?)'
    ).run(title || 'Untitled Diagram', xml_data, req.user.id);
    const diagram = db.prepare('SELECT * FROM diagrams WHERE id = ?').get(result.lastInsertRowid);
    Logger.info(`Diagram created: id=${diagram.id} by user=${req.user.id}`);
    res.status(201).json(diagram);
  } catch (error) {
    Logger.error('Create diagram error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/diagrams/:id - get single diagram
router.get('/:id', diagramLimiter, async (req, res) => {
  try {
    const db = getDb();
    const diagram = db.prepare(
      'SELECT * FROM diagrams WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.id);
    if (!diagram) {
      return res.status(404).json({ error: 'Diagram not found' });
    }
    res.json(diagram);
  } catch (error) {
    Logger.error('Get diagram error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/diagrams/:id - update diagram
router.put('/:id', diagramLimiter, async (req, res) => {
  try {
    const db = getDb();
    const { title, xml_data } = req.body;
    if (xml_data !== undefined && typeof xml_data === 'string' && xml_data.length > 5_000_000) {
      return res.status(413).json({ error: 'Diagram XML too large (max 5MB)' });
    }
    const existing = db.prepare(
      'SELECT id FROM diagrams WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Diagram not found' });
    }
    if (xml_data !== undefined) {
      db.prepare(
        'UPDATE diagrams SET xml_data = ?, title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(xml_data, title || 'Untitled Diagram', req.params.id);
    } else {
      db.prepare(
        'UPDATE diagrams SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(title || 'Untitled Diagram', req.params.id);
    }
    const diagram = db.prepare('SELECT id, title, created_at, updated_at FROM diagrams WHERE id = ?').get(req.params.id);
    Logger.info(`Diagram updated: id=${req.params.id} by user=${req.user.id}`);
    res.json(diagram);
  } catch (error) {
    Logger.error('Update diagram error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/diagrams/:id - delete diagram
router.delete('/:id', diagramLimiter, async (req, res) => {
  try {
    const db = getDb();
    const existing = db.prepare(
      'SELECT id FROM diagrams WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Diagram not found' });
    }
    db.prepare('DELETE FROM diagrams WHERE id = ?').run(req.params.id);
    Logger.info(`Diagram deleted: id=${req.params.id} by user=${req.user.id}`);
    res.json({ success: true });
  } catch (error) {
    Logger.error('Delete diagram error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
