import { Router } from 'express';
import { pool } from '../db.js';
import { q } from '../utils/sql.js';
import requireAuth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();

/**
 * GET /api/payroll?month=YYYY-MM
 * Aggregated earnings + incentives/deductions per employee for a month.
 *
 * Requires tables:
 *   - employees (id, emp_code, name, ...)
 *   - v_production_valued (employee_id, amount, entry_date)
 *   - employee_adjustments (employee_id, kind[incentive|deduction], amount, date)
 */
router.get('/', requireAuth, requireRole('admin', 'incharge'), async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    if (!month) return res.status(400).json({ error: 'month (YYYY-MM) is required' });
    const [year, mon] = month.split('-').map(Number);
    if (!year || !mon) return res.status(400).json({ error: 'Invalid month format' });

    const rows = await q(pool, `
      SELECT
        e.id AS employee_id,
        e.emp_code,
        e.name,
        COALESCE(SUM(v.amount), 0) AS earnings,
        COALESCE(SUM(CASE WHEN ea.kind='incentive' THEN ea.amount ELSE 0 END), 0) AS incentives,
        COALESCE(SUM(CASE WHEN ea.kind='deduction' THEN ea.amount ELSE 0 END), 0) AS deductions,
        (
          COALESCE(SUM(v.amount),0)
          + COALESCE(SUM(CASE WHEN ea.kind='incentive' THEN ea.amount ELSE 0 END),0)
          - COALESCE(SUM(CASE WHEN ea.kind='deduction' THEN ea.amount ELSE 0 END),0)
        ) AS net_salary
      FROM employees e
      LEFT JOIN v_production_valued v
        ON v.employee_id = e.id AND YEAR(v.entry_date)=? AND MONTH(v.entry_date)=?
      LEFT JOIN employee_adjustments ea
        ON ea.employee_id = e.id AND YEAR(ea.date)=? AND MONTH(ea.date)=?
      GROUP BY e.id, e.emp_code, e.name
      ORDER BY e.name ASC
    `, [year, mon, year, mon]);

    res.json(rows);
  } catch (e) {
    console.error('GET /payroll error:', e);
    res.status(500).json({ error: 'Failed to compute payroll' });
  }
});

export default router;
