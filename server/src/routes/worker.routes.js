import { Router } from 'express';
import { pool } from '../db.js';
import { q } from '../utils/sql.js';
import requireAuth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();

/**
 * Resolve the logged-in user's employee_id by multiple strategies.
 */
async function resolveEmployeeId(userId) {
  // Fetch user for fallbacks
  const [user] = await q(pool, 'SELECT id, id_number, phone FROM users WHERE id=? LIMIT 1', [userId]) || [];

  // 1) Direct FK
  const byUserId = await q(pool, 'SELECT id FROM employees WHERE user_id=? LIMIT 1', [userId]);
  if (byUserId.length) return { employeeId: byUserId[0].id, user };

  // 2) emp_code == id_number
  if (user?.id_number) {
    const byEmpCode = await q(pool, 'SELECT id FROM employees WHERE emp_code=? LIMIT 1', [user.id_number]);
    if (byEmpCode.length) return { employeeId: byEmpCode[0].id, user };
  }

  // 3) phone match
  if (user?.phone) {
    const byPhone = await q(pool, 'SELECT id FROM employees WHERE phone=? LIMIT 1', [user.phone]);
    if (byPhone.length) return { employeeId: byPhone[0].id, user };
  }

  return { employeeId: null, user };
}

/**
 * GET /api/worker/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns { total_income, entries:[...] } for the logged-in worker.
 */
router.get('/summary', requireAuth, requireRole('worker'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { employeeId } = await resolveEmployeeId(userId);
    if (!employeeId) return res.json({ total_income: 0, entries: [] });

    const { from, to } = req.query;
    const where = ['pe.employee_id = ?'];
    const params = [employeeId];
    if (from) { where.push('pe.entry_date >= ?'); params.push(from); }
    if (to)   { where.push('pe.entry_date <= ?'); params.push(to); }

    const rows = await q(pool, `
      SELECT
        pe.id,
        pe.entry_date,
        l.lot_number,
        lo.op_name,
        lo.rate_per_piece,
        pe.pcs,
        (pe.pcs * lo.rate_per_piece) AS income
      FROM production_entries pe
      JOIN lot_operations lo ON pe.operation_id = lo.id
      JOIN lots l           ON pe.lot_id = l.id
      WHERE ${where.join(' AND ')}
      ORDER BY pe.entry_date DESC, pe.id DESC
    `, params);

    const total = rows.reduce((sum, r) => sum + Number(r.income || 0), 0);
    res.json({ total_income: total, entries: rows });
  } catch (e) {
    console.error('Worker summary error:', e);
    res.status(500).json({ error: 'Failed to load worker summary' });
  }
});

/**
 * GET /api/worker/monthly
 * Returns [{ month:'YYYY-MM', total_income: number }, ...] for the worker.
 */
router.get('/monthly', requireAuth, requireRole('worker'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { employeeId } = await resolveEmployeeId(userId);
    if (!employeeId) return res.json([]);

    const rows = await q(pool, `
      SELECT
        DATE_FORMAT(pe.entry_date, '%Y-%m') AS month,
        SUM(pe.pcs * lo.rate_per_piece)     AS total_income
      FROM production_entries pe
      JOIN lot_operations lo ON pe.operation_id = lo.id
      WHERE pe.employee_id = ?
      GROUP BY DATE_FORMAT(pe.entry_date, '%Y-%m')
      ORDER BY month
    `, [employeeId]);

    res.json(rows);
  } catch (e) {
    console.error('Worker monthly error:', e);
    res.status(500).json({ error: 'Failed to load monthly data' });
  }
});

export default router;
