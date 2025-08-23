// server/src/routes/me.routes.js
import { Router } from 'express';
import { pool } from '../db.js';
import { q } from '../utils/sql.js';
import { auth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/me
 * Returns the current user's profile
 */
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const rows = await q(
      pool,
      `SELECT id, id_number, role, name, age, gender, photo_url,
              bank_account, ifsc, phone, date_of_joining, created_at, is_active
       FROM users WHERE id=? LIMIT 1`,
      [userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (e) {
    console.error('GET /me error:', e);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

/**
 * PUT /api/me
 * Optional: allow self-updates for safe fields
 */
router.put('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const allowed = ['name', 'age', 'gender', 'phone', 'bank_account', 'ifsc', 'photo_url'];
    const updates = {};
    for (const k of allowed) {
      if (k in req.body) updates[k] = req.body[k];
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Build dynamic SQL
    const fields = Object.keys(updates).map(k => `${k}=?`).join(', ');
    const params = [...Object.values(updates), userId];
    await q(pool, `UPDATE users SET ${fields} WHERE id=?`, params);

    const [me] = await q(
      pool,
      `SELECT id, id_number, role, name, age, gender, photo_url,
              bank_account, ifsc, phone, date_of_joining, created_at, is_active
       FROM users WHERE id=? LIMIT 1`,
      [userId]
    );
    res.json(me);
  } catch (e) {
    console.error('PUT /me error:', e);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
