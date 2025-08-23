import { Router } from 'express';
import { pool } from '../db.js';
import { q } from '../utils/sql.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import bcrypt from 'bcryptjs';

const router = Router();

// List users (admin)
router.get('/', auth, requireRole('admin'), async (req, res) => {
  const rows = await q(pool, 'SELECT id, id_number, role, name, age, gender, photo_url, bank_account, ifsc, phone, date_of_joining, is_active, created_at FROM users ORDER BY id DESC');
  res.json(rows);
});

// Create user (admin) with detailed fields
router.post('/', auth, requireRole('admin'), async (req, res) => {
  const { id_number, password, role, name, age, gender, photo_url, bank_account, ifsc, phone, date_of_joining, is_active } = req.body;
  if (!id_number || !password || !role || !name) return res.status(400).json({ error: 'id_number, password, role, name are required' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const result = await q(pool,
      'INSERT INTO users (id_number, password_hash, role, name, age, gender, photo_url, bank_account, ifsc, phone, date_of_joining, is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [id_number, hash, role, name, age||null, gender||null, photo_url||null, bank_account||null, ifsc||null, phone||null, date_of_joining||null, (is_active??1)]
    );

    // If worker, ensure an employee entry exists (used by production/payroll)
    if (role === 'worker') {
      const userId = result.insertId;
      await q(pool,
        'INSERT INTO employees (user_id, emp_code, name, phone, bank_account, ifsc, id_number) VALUES (?,?,?,?,?,?,?)',
        [userId, id_number, name, phone||null, bank_account||null, ifsc||null, id_number]
      );
    }

    res.json({ message: 'User created' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Update role/active and profile (admin)
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  const { role, is_active, name, age, gender, photo_url, bank_account, ifsc, phone, date_of_joining } = req.body;
  await q(pool,
    'UPDATE users SET role=COALESCE(?,role), is_active=COALESCE(?,is_active), name=COALESCE(?,name), age=COALESCE(?,age), gender=COALESCE(?,gender), photo_url=COALESCE(?,photo_url), bank_account=COALESCE(?,bank_account), ifsc=COALESCE(?,ifsc), phone=COALESCE(?,phone), date_of_joining=COALESCE(?,date_of_joining) WHERE id=?',
    [role, is_active, name, age, gender, photo_url, bank_account, ifsc, phone, date_of_joining, req.params.id]
  );
  res.json({ message: 'User updated' });
});

// Change password (admin or self)
router.put('/:id/password', auth, async (req, res) => {
  const { id } = req.params; const { new_password } = req.body;
  if (!new_password) return res.status(400).json({ error: 'new_password required' });
  if (req.user.role !== 'admin' && String(req.user.id) !== String(id)) return res.status(403).json({ error: 'Forbidden' });
  const hash = await bcrypt.hash(new_password, 10);
  await q(pool, 'UPDATE users SET password_hash=? WHERE id=?', [hash, id]);
  res.json({ message: 'Password updated' });
});

export default router;
