import { Router } from 'express';
import { pool } from '../db.js';
import { q } from '../utils/sql.js';
import requireAuth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();

/** POST /api/production - add an entry */
router.post('/', requireAuth, requireRole('admin', 'supervisor'), async (req, res) => {
  try {
    const { lot_id, operation_id, employee_id, pcs, entry_date } = req.body;
    if (!lot_id || !operation_id || !employee_id || !pcs || !entry_date) {
      return res.status(400).json({ error: 'lot_id, operation_id, employee_id, pcs, entry_date are required' });
    }
    await q(pool,
      `INSERT INTO production_entries (lot_id, operation_id, employee_id, pcs, entry_date)
       VALUES (?,?,?,?,?)`,
      [lot_id, operation_id, employee_id, pcs, entry_date]
    );
    res.json({ message: 'Production entry recorded' });
  } catch (e) {
    console.error('POST /production error:', e);
    res.status(500).json({ error: 'Failed to record production' });
  }
});

/** GET /api/production - list entries (filters optional) */
router.get('/', requireAuth, requireRole('admin','supervisor','incharge'), async (req, res) => {
  try {
    const { from, to, lot_id, employee_id } = req.query;
    const params = [];
    let sql = `
      SELECT pe.*, lo.op_name, lo.rate_per_piece, e.name AS employee_name, l.lot_number
        FROM production_entries pe
        JOIN lot_operations lo ON lo.id = pe.operation_id
        JOIN employees e       ON e.id = pe.employee_id
        JOIN lots l            ON l.id = pe.lot_id
       WHERE 1=1`;

    if (from)        { sql += ' AND pe.entry_date >= ?'; params.push(from); }
    if (to)          { sql += ' AND pe.entry_date <= ?'; params.push(to); }
    if (lot_id)      { sql += ' AND pe.lot_id = ?'; params.push(lot_id); }
    if (employee_id) { sql += ' AND pe.employee_id = ?'; params.push(employee_id); }

    sql += ' ORDER BY pe.entry_date DESC, pe.id DESC';

    const rows = await q(pool, sql, params);
    res.json(rows);
  } catch (e) {
    console.error('GET /production error:', e);
    res.status(500).json({ error: 'Failed to load production entries' });
  }
});

export default router;
