import express from 'express';
import snippetRepository from '../repositories/snippetRepository.js';
import Logger from '../logger.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = express.Router();
const snippetWriteLimiter = rateLimit({ max: 20, windowMs: 60_000 });

router.get('/', async (req, res) => {
  try {
    const { offset = 0, limit = 50, search, language, sortBy, category } = req.query;
    const result = await snippetRepository.getUserSnippets(
      req.user.id,
      parseInt(offset),
      parseInt(limit),
      search || '',
      language || '',
      sortBy || 'newest',
      category || ''
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

router.post('/', snippetWriteLimiter, async (req, res) => {
   try {
     const { title, description, fragments, categories, isPublic, steps } = req.body;

     if (!title || ((!fragments || fragments.length === 0) && (!steps || steps.length === 0))) {
       return res.status(400).json({ error: 'Title and at least one fragment or step required' });
     }

     if (title.length > 200) {
       return res.status(400).json({ error: 'Title must be 200 characters or less' });
     }

     if (description && description.length > 5000) {
       return res.status(400).json({ error: 'Description must be 5000 characters or less' });
     }

     for (const frag of (fragments || [])) {
       if (frag.code.length > 100000) {
         return res.status(400).json({ error: 'Each fragment must be 100KB or less' });
       }
     }

     for (const step of (steps || [])) {
       if (step.code.length > 100000) {
         return res.status(400).json({ error: 'Each step code must be 100KB or less' });
       }
     }

     const snippet = await snippetRepository.create(
       title,
       description || '',
       req.user.id,
       fragments || [],
       isPublic || false,
       categories || [],
       steps || []
     );

    res.status(201).json(snippet);
  } catch (error) {
    Logger.error('Create snippet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', snippetWriteLimiter, async (req, res) => {
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

router.delete('/:id', snippetWriteLimiter, async (req, res) => {
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
