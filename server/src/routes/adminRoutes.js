import express from 'express';
import userRepository from '../repositories/userRepository.js';
import snippetRepository from '../repositories/snippetRepository.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = express.Router();
const adminLimiter = rateLimit({ max: 30, windowMs: 60_000 });

router.get('/users', adminLimiter, async (req, res) => {
  try {
    const users = await userRepository.getAllWithApproval();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users/pending', adminLimiter, async (req, res) => {
  try {
    const users = await userRepository.getPending();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id/approve', adminLimiter, async (req, res) => {
  try {
    await userRepository.approve(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id/reject', adminLimiter, async (req, res) => {
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

router.put('/users/:id/activate', adminLimiter, async (req, res) => {
  try {
    await userRepository.activate(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id/deactivate', adminLimiter, async (req, res) => {
  try {
    await userRepository.deactivate(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id/make-admin', adminLimiter, async (req, res) => {
  try {
    await userRepository.makeAdmin(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id/demote', adminLimiter, async (req, res) => {
  try {
    await userRepository.demote(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/users/:id', adminLimiter, async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    const adminCount = await userRepository.countAdmins();
    const target = await userRepository.findById(targetId);
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (target.is_admin && adminCount <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last admin' });
    }
    await userRepository.deleteUser(targetId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/snippets', adminLimiter, async (req, res) => {
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
