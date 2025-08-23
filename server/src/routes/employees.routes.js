import { Router } from 'express';
import { pool } from '../db.js';
import { q } from '../utils/sql.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.get('/', auth, requireRole('admin','supervisor','incharge'), async (req, res) => {
  const rows = await q(pool, 'SELECT * FROM employees ORDER BY created_at DESC');
  res.json(rows);
});

export default router;
