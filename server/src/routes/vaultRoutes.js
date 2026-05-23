import express from 'express';
import vaultRepository from '../repositories/vaultRepository.js';
import { authenticateToken } from '../middleware/auth.js';
import { encrypt, decrypt } from '../utils/vaultCrypto.js';
import { rateLimit } from '../middleware/rateLimit.js';
import Logger from '../logger.js';

const router = express.Router();
router.use(authenticateToken);

// Rate limiting for vault operations
const vaultLimiter = rateLimit({ max: 30, windowMs: 60_000, message: 'Too many vault operations' });
const decryptLimiter = rateLimit({ max: 10, windowMs: 60_000, message: 'Too many decryption attempts' });
router.use(vaultLimiter);

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
    Logger.info(`VAULT CREATE: user=${req.user.username} entry_id=${entry.id} entry_name=${name} type=${type} ip=${req.ip}`);
    res.status(201).json({ id: entry.id, name: entry.name, type: entry.type, host: entry.host, username: entry.username });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, type, host, username, value, notes, masterKey } = req.body;
    if (!masterKey) return res.status(400).json({ error: 'masterKey is required' });
    const existing = await vaultRepository.findById(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Entry not found' });
    if (value) {
      const { encrypted, iv, authTag } = await encrypt(value, masterKey);
      const entry = await vaultRepository.update(req.params.id, req.user.id, name, type, encrypted, iv, authTag, host, username, notes);
      if (!entry) return res.status(404).json({ error: 'Entry not found' });
      Logger.info(`VAULT UPDATE: user=${req.user.username} entry_id=${req.params.id} entry_name=${name} ip=${req.ip}`);
      res.json({ id: entry.id, name: entry.name });
    } else {
      const entry = await vaultRepository.update(req.params.id, req.user.id, name, type, null, null, null, host, username, notes);
      if (!entry) return res.status(404).json({ error: 'Entry not found' });
      Logger.info(`VAULT UPDATE (metadata): user=${req.user.username} entry_id=${req.params.id} entry_name=${name} ip=${req.ip}`);
      res.json({ id: entry.id, name: entry.name });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

router.get('/:id/decrypt', decryptLimiter, async (req, res) => {
  try {
    const { masterKey } = req.query;
    if (!masterKey) return res.status(400).json({ error: 'masterKey is required' });
    const entry = await vaultRepository.findById(req.params.id, req.user.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    Logger.info(`VAULT DECRYPT: user=${req.user.username} entry_id=${req.params.id} entry_name=${entry.name} ip=${req.ip}`);
    const value = await vaultRepository.decryptValue(req.params.id, req.user.id, masterKey);
    if (value === null) return res.status(404).json({ error: 'Entry not found' });
    res.json({ value });
  } catch {
    Logger.warn(`VAULT DECRYPT FAILED: user=${req.user?.username || 'unknown'} entry_id=${req.params.id} ip=${req.ip}`);
    res.status(403).json({ error: 'Decryption failed - wrong master key' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const existing = await vaultRepository.findById(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Entry not found' });
    const deleted = await vaultRepository.delete(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Entry not found' });
    Logger.info(`VAULT DELETE: user=${req.user.username} entry_id=${req.params.id} entry_name=${existing.name} ip=${req.ip}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

export default router;
