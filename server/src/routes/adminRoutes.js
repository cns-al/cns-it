import express from 'express';
import userRepository from '../repositories/userRepository.js';
import snippetRepository from '../repositories/snippetRepository.js';

const router = express.Router();

router.get('/users', async (req, res) => {
  try {
    const users = await userRepository.getAllWithApproval();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users/pending', async (req, res) => {
  try {
    const users = await userRepository.getPending();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id/approve', async (req, res) => {
  try {
    await userRepository.approve(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id/reject', async (req, res) => {
  try {
    const changes = await userRepository.reject(req.params.id);
    if (changes.changes === 0) {
      return res.status(404).json({ error: 'User not found or already processed' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id/activate', async (req, res) => {
  try {
    await userRepository.activate(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id/deactivate', async (req, res) => {
  try {
    await userRepository.deactivate(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id/make-admin', async (req, res) => {
  try {
    await userRepository.makeAdmin(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id/demote', async (req, res) => {
  try {
    await userRepository.demote(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/snippets', async (req, res) => {
  try {
    const { userId } = req.query;
    if (userId) {
      const result = await snippetRepository.getUserSnippets(parseInt(userId), 0, 100);
      res.json(result);
    } else {
      res.json({ error: 'userId required' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
