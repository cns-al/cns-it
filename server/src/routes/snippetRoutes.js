import express from 'express';
import snippetRepository from '../repositories/snippetRepository.js';
import Logger from '../logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { offset = 0, limit = 50, search, language, sortBy } = req.query;
    const result = await snippetRepository.getUserSnippets(
      req.user.id,
      parseInt(offset),
      parseInt(limit),
      search || '',
      language || '',
      sortBy || 'newest'
    );
    res.json(result);
  } catch (error) {
    Logger.error('Get snippets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await snippetRepository.getCategories(req.user.id);
    res.json(categories);
  } catch (error) {
    Logger.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/recycle', async (req, res) => {
  try {
    const { offset = 0, limit = 50 } = req.query;
    const snippets = await snippetRepository.getRecycleBin(req.user.id, parseInt(offset), parseInt(limit));
    res.json(snippets);
  } catch (error) {
    Logger.error('Get recycle bin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/recycle/:id/restore', async (req, res) => {
  try {
    await snippetRepository.restore(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    Logger.error('Restore snippet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/recycle/:id', async (req, res) => {
  try {
    await snippetRepository.permanentDelete(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    Logger.error('Permanent delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const snippet = await snippetRepository.findById(req.params.id, req.user.id);
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    res.json(snippet);
  } catch (error) {
    Logger.error('Get snippet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, fragments, categories, isPublic } = req.body;

    if (!title || !fragments || fragments.length === 0) {
      return res.status(400).json({ error: 'Title and at least one fragment required' });
    }

    const snippet = await snippetRepository.create(
      title,
      description || '',
      req.user.id,
      fragments,
      isPublic || false,
      categories || []
    );

    res.status(201).json(snippet);
  } catch (error) {
    Logger.error('Create snippet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const snippet = await snippetRepository.findById(req.params.id, req.user.id);
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    const updated = await snippetRepository.update(req.params.id, req.user.id, req.body);
    res.json(updated);
  } catch (error) {
    Logger.error('Update snippet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const snippet = await snippetRepository.findById(req.params.id, req.user.id);
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    await snippetRepository.softDelete(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    Logger.error('Delete snippet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
