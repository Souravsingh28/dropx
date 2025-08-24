import { Router } from 'express';
import { pool } from '../db.js';
import { q } from '../utils/sql.js';
import requireAuth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();

/**
 * GET /api/employees?limit=&offset=
 */
router.get('/', requireAuth, requireRole('admin','supervisor','incharge'), async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;
    const rows = await q(
      pool,
      'SELECT id, user_id, emp_code, name, role, phone, is_active, created_at FROM employees ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    res.json(rows);
  } catch (e) {
    console.error('GET /employees error:', e);
    res.status(500).json({ error: 'Failed to load employees' });
  }
});

export default router;
