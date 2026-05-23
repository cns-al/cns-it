import express from 'express';
import vaultRepository from '../repositories/vaultRepository.js';
import { authenticateToken } from '../middleware/auth.js';
import { encrypt, decrypt } from '../utils/vaultCrypto.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const entries = await vaultRepository.findAll(req.user.id);
    res.json({ data: entries.map(e => ({
      id: e.id,
      name: e.name,
      type: e.type,
      host: e.host,
      username: e.username,
      notes: e.notes,
      created_at: e.created_at,
      updated_at: e.updated_at,
      encrypted: true
    }))});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vault entries' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ data: [] });
    const entries = await vaultRepository.search(req.user.id, q);
    res.json({ data: entries.map(e => ({
      id: e.id,
      name: e.name,
      type: e.type,
      host: e.host,
      username: e.username,
      notes: e.notes,
      created_at: e.created_at,
      updated_at: e.updated_at,
      encrypted: true
    }))});
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, type = 'password', host, username, value, notes, masterKey } = req.body;
    if (!name || !value || !masterKey) {
      return res.status(400).json({ error: 'Name, value, and masterKey are required' });
    }
    const { encrypted, iv, authTag } = await encrypt(value, masterKey);
    const entry = await vaultRepository.create(name, type, encrypted, iv, authTag, req.user.id, host, username, notes);
    res.status(201).json({ id: entry.id, name: entry.name, type: entry.type, host: entry.host, username: entry.username });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, type, host, username, value, notes, masterKey } = req.body;
    if (!masterKey) return res.status(400).json({ error: 'masterKey is required' });
    if (value) {
      const { encrypted, iv, authTag } = await encrypt(value, masterKey);
      const entry = await vaultRepository.update(req.params.id, req.user.id, name, type, encrypted, iv, authTag, host, username, notes);
      if (!entry) return res.status(404).json({ error: 'Entry not found' });
      res.json({ id: entry.id, name: entry.name });
    } else {
      const entry = await vaultRepository.update(req.params.id, req.user.id, name, type, null, null, null, host, username, notes);
      if (!entry) return res.status(404).json({ error: 'Entry not found' });
      res.json({ id: entry.id, name: entry.name });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

router.get('/:id/decrypt', async (req, res) => {
  try {
    const { masterKey } = req.query;
    if (!masterKey) return res.status(400).json({ error: 'masterKey is required' });
    const value = await vaultRepository.decryptValue(req.params.id, req.user.id, masterKey);
    if (value === null) return res.status(404).json({ error: 'Entry not found' });
    res.json({ value });
  } catch {
    res.status(403).json({ error: 'Decryption failed - wrong master key' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await vaultRepository.delete(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Entry not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

export default router;
