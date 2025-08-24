import { Router } from 'express';
import { pool } from '../db.js';
import { q } from '../utils/sql.js';
import requireAuth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';
import bcrypt from 'bcryptjs';

const router = Router();

/**
 * GET /api/users
 * List all users (admin).
 */
router.get('/', requireAuth, requireRole('admin'), async (_req, res) => {
  try {
    const rows = await q(
      pool,
      'SELECT id, id_number, role, name, age, gender, photo_url, bank_account, ifsc, phone, date_of_joining, is_active, created_at FROM users ORDER BY id DESC'
    );
    res.json(rows);
  } catch (e) {
    console.error('GET /users error:', e);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

/**
 * POST /api/users
 * Create a user (admin).
 * If role === 'worker', auto-create an employees row for payroll/production.
 */
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const {
      id_number, password, role, name,
      age, gender, photo_url, bank_account, ifsc, phone, date_of_joining,
      is_active
    } = req.body;

    if (!id_number || !password || !role || !name) {
      return res.status(400).json({ error: 'id_number, password, role, name are required' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await q(
      pool,
      `INSERT INTO users
        (id_number, password_hash, role, name, age, gender, photo_url, bank_account, ifsc, phone, date_of_joining, is_active)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id_number, hash, role, name,
        age ?? null, gender ?? null, photo_url ?? null,
        bank_account ?? null, ifsc ?? null, phone ?? null,
        date_of_joining ?? null, (is_active ?? 1)
      ]
    );

    // If worker, ensure an employees entry exists
    if (role === 'worker') {
      const userId = result.insertId;
      await q(
        pool,
        `INSERT INTO employees (user_id, emp_code, name, role, phone, is_active)
         VALUES (?,?,?,?,?,?)`,
        [userId, id_number, name, 'worker', phone ?? null, (is_active ?? 1)]
      );
    }

    res.json({ message: 'User created', id: result.insertId });
  } catch (e) {
    console.error('POST /users error:', e);
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'id_number already exists' });
    }
    res.status(400).json({ error: e.message });
  }
});

/**
 * PUT /api/users/:id
 * Update role/active and profile fields (admin).
 */
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role, is_active, name, age, gender, photo_url, bank_account, ifsc, phone, date_of_joining } = req.body;

    await q(
      pool,
      `UPDATE users
       SET role = COALESCE(?, role),
           is_active = COALESCE(?, is_active),
           name = COALESCE(?, name),
           age = COALESCE(?, age),
           gender = COALESCE(?, gender),
           photo_url = COALESCE(?, photo_url),
           bank_account = COALESCE(?, bank_account),
           ifsc = COALESCE(?, ifsc),
           phone = COALESCE(?, phone),
           date_of_joining = COALESCE(?, date_of_joining)
       WHERE id = ?`,
      [role, is_active, name, age, gender, photo_url, bank_account, ifsc, phone, date_of_joining, id]
    );

    res.json({ message: 'User updated' });
  } catch (e) {
    console.error('PUT /users/:id error:', e);
    res.status(400).json({ error: e.message });
  }
});

/**
 * PUT /api/users/:id/password
 * Change password (admin or self).
 */
router.put('/:id/password', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;
    if (!new_password) return res.status(400).json({ error: 'new_password required' });

    if (req.user.role !== 'admin' && String(req.user.id) !== String(id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const hash = await bcrypt.hash(new_password, 10);
    await q(pool, 'UPDATE users SET password_hash=? WHERE id=?', [hash, id]);
    res.json({ message: 'Password updated' });
  } catch (e) {
    console.error('PUT /users/:id/password error:', e);
    res.status(400).json({ error: e.message });
  }
});

export default router;
