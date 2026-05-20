import express from 'express';
import snippetRepository from '../repositories/snippetRepository.js';
import shareRepository from '../repositories/shareRepository.js';
import Logger from '../logger.js';

const router = express.Router();

router.post('/:snippetId', async (req, res) => {
  try {
    const snippet = await snippetRepository.findById(req.params.snippetId, req.user.id);
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    const { expiresIn } = req.body;
    let expiresAt = null;
    if (expiresIn) {
      const date = new Date();
      switch (expiresIn) {
        case '1h': date.setHours(date.getHours() + 1); break;
        case '24h': date.setDate(date.getDate() + 1); break;
        case '7d': date.setDate(date.getDate() + 7); break;
        case '30d': date.setMonth(date.getMonth() + 1); break;
      }
      expiresAt = date.toISOString();
    }

    const token = await shareRepository.create(snippet.id, req.user.id, expiresAt);
    res.status(201).json({ token, expiresAt });
  } catch (error) {
    Logger.error('Create share error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:snippetId', async (req, res) => {
  try {
    const shares = await shareRepository.getBySnippetId(req.params.snippetId, req.user.id);
    res.json(shares);
  } catch (error) {
    Logger.error('Get shares error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:snippetId/:shareId', async (req, res) => {
  try {
    await shareRepository.delete(req.params.shareId, req.params.snippetId, req.user.id);
    res.json({ success: true });
  } catch (error) {
    Logger.error('Delete share error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
