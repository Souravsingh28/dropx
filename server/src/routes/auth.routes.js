import { Router } from 'express';
import { pool } from '../db.js';
import { q } from '../utils/sql.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// TEMP: read dev bypass from env
const DEV_BYPASS = process.env.DEV_BYPASS === '1';
const DEV_BYPASS_PASSWORD = process.env.DEV_BYPASS_PASSWORD || '';

router.post('/login', async (req, res) => {
  const { id_number, password } = req.body || {};
  console.log('[LOGIN] payload:', { id_number, gotPassword: !!password });

  try {
    // 1) Fetch user by id_number
    const users = await q(pool, 'SELECT * FROM users WHERE id_number=? AND is_active=1', [id_number]);
    console.log('[LOGIN] users found:', users.length);

    if (!users.length) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const hash = user.password_hash;
    console.log('[LOGIN] hash length:', (hash || '').length, 'role:', user.role);

    // 2) Optional dev bypass (for debugging only)
    if (DEV_BYPASS && password === DEV_BYPASS_PASSWORD) {
      console.log('[LOGIN] DEV_BYPASS accepted');
      const token = jwt.sign({ id: user.id, id_number: user.id_number, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
      return res.json({ token, user: { id: user.id, id_number: user.id_number, role: user.role, name: user.name } });
    }

    // 3) Normal bcrypt check
    const ok = await bcrypt.compare(password, hash);
    console.log('[LOGIN] bcrypt.compare:', ok);

    if (!ok) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, id_number: user.id_number, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, user: { id: user.id, id_number: user.id_number, role: user.role, name: user.name } });
  } catch (e) {
    console.error('[LOGIN] ERROR:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
