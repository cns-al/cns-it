import express from 'express';
import apiKeyRepository from '../repositories/apiKeyRepository.js';
import Logger from '../logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const keys = await apiKeyRepository.getByUserId(req.user.id);
    res.json(keys);
  } catch (error) {
    Logger.error('Get API keys error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Key name required' });
    }
    const key = await apiKeyRepository.create(name, req.user.id);
    res.status(201).json(key);
  } catch (error) {
    Logger.error('Create API key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await apiKeyRepository.delete(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    Logger.error('Delete API key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
