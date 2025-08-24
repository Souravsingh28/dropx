import { Router } from 'express';
import { pool } from '../db.js';
import { q } from '../utils/sql.js';
import requireAuth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();

// GET /api/dashboard/summary
router.get('/summary', requireAuth, requireRole('admin', 'supervisor', 'incharge'), async (_req, res) => {
  try {
    const [totals] = await q(pool, 'SELECT COUNT(*) AS employees FROM employees');
    const [lotsCount] = await q(pool, 'SELECT COUNT(*) AS lots FROM lots');

    const recent = await q(pool, `
      SELECT pe.id, pe.entry_date, e.name, l.lot_number, lo.op_name, pe.pcs
        FROM production_entries pe
        JOIN employees e      ON e.id = pe.employee_id
        JOIN lots l           ON l.id = pe.lot_id
        JOIN lot_operations lo ON lo.id = pe.operation_id
       ORDER BY pe.entry_date DESC, pe.id DESC
       LIMIT 10
    `);

    const lotProgress = await q(pool, `
      SELECT l.id, l.lot_number, l.target_qty, COALESCE(SUM(pe.pcs),0) AS produced
        FROM lots l
        LEFT JOIN production_entries pe ON pe.lot_id = l.id
       GROUP BY l.id, l.lot_number, l.target_qty
       ORDER BY l.id DESC
    `);

    res.json({ totals, lotsCount, recent, lotProgress });
  } catch (e) {
    console.error('GET /dashboard/summary error:', e);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

export default router;
