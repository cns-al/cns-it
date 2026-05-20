import express from 'express';
import snippetRepository from '../repositories/snippetRepository.js';
import shareRepository from '../repositories/shareRepository.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { offset = 0, limit = 50, search } = req.query;
    const snippets = await snippetRepository.getPublicSnippets(parseInt(offset), parseInt(limit), search || '');
    res.json(snippets);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/share/:token', async (req, res) => {
  try {
    const snippet = await snippetRepository.getSnippetByShareToken(req.params.token);
    if (!snippet) {
      return res.status(404).json({ error: 'Shared snippet not found or expired' });
    }
    res.json(snippet);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
