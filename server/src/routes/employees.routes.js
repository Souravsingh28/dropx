import { Router } from 'express';
import { pool } from '../db.js';
import { q } from '../utils/sql.js';
import requireAuth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();

/** GET /api/employees - list */
router.get('/', requireAuth, requireRole('admin','supervisor','incharge'), async (_req, res) => {
  const rows = await q(pool, 'SELECT * FROM employees ORDER BY created_at DESC');
  res.json(rows);
});

export default router;
