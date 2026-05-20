import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/database.js';
import userRepository from '../repositories/userRepository.js';
import { JWT_SECRET, TOKEN_EXPIRY, ALLOW_NEW_ACCOUNTS, DISABLE_ACCOUNTS, DISABLE_INTERNAL_ACCOUNTS } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import Logger from '../logger.js';

const router = express.Router();

const loginLimiter = rateLimit({ max: 5, windowMs: 15 * 60 * 1000, message: 'Too many login attempts, please try again later' });
const registerLimiter = rateLimit({ max: 3, windowMs: 15 * 60 * 1000, message: 'Too many registration attempts, please try again later' });
const changePasswordLimiter = rateLimit({ max: 5, windowMs: 15 * 60 * 1000, message: 'Too many password change attempts, please try again later' });

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await userRepository.findByUsername(username);
    if (!user || !user.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    if (user.is_active === 0) {
      return res.status(403).json({ error: 'Account deactivated' });
    }

    if (user.is_approved === 0) {
      return res.status(403).json({ error: 'Account pending approval' });
    }

    await userRepository.updateLastLogin(user.id);

    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin: user.is_admin === 1 },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.is_admin === 1
      }
    });
  } catch (error) {
    Logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', registerLimiter, async (req, res) => {
  try {
    if (!ALLOW_NEW_ACCOUNTS && (await userRepository.count()) > 0) {
      return res.status(403).json({ error: 'Registration is disabled' });
    }

    if (DISABLE_INTERNAL_ACCOUNTS) {
      return res.status(403).json({ error: 'Internal accounts are disabled' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (username.length < 3 || username.length > 30 || !/^[a-zA-Z0-9_-]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, underscores, and hyphens (3-30 characters)' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await userRepository.findByUsername(username);
    if (existing) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userCount = await userRepository.count();
    const isFirstUser = userCount === 0;
    const user = await userRepository.create(username, passwordHash, isFirstUser);

    if (isFirstUser) {
      await userRepository.makeAdmin(user.id);
      // Re-fetch user after makeAdmin so JWT has correct isAdmin flag
      const adminUser = await userRepository.findById(user.id);
      const token = jwt.sign(
        { id: adminUser.id, username: adminUser.username, isAdmin: adminUser.is_admin === 1 },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );
      return res.status(201).json({
        token,
        user: {
          id: adminUser.id,
          username: adminUser.username,
          isAdmin: adminUser.is_admin === 1
        },
        message: 'Registration successful. You are the first admin.'
      });
    }

    if (!isFirstUser) {
      return res.status(202).json({
        message: 'Registration successful. Your account is pending admin approval.',
        pending: true
      });
    }
  } catch (error) {
    Logger.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/change-password', changePasswordLimiter, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await userRepository.findByUsername(req.user.username);
    if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePassword(userId, newHash);

    res.json({ success: true });
  } catch (error) {
    Logger.error('Password change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/status', async (req, res) => {
  try {
    const userCount = await userRepository.count();
    res.json({
      accountsDisabled: DISABLE_ACCOUNTS,
      internalAccountsDisabled: DISABLE_INTERNAL_ACCOUNTS,
      allowNewAccounts: ALLOW_NEW_ACCOUNTS,
      allowPasswordChanges: process.env.ALLOW_PASSWORD_CHANGES === 'true',
      hasUsers: userCount > 0,
      version: '1.0.0'
    });
  } catch (error) {
    Logger.error('Status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
