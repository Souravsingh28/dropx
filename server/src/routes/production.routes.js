import { Router } from 'express';
import { pool } from '../db.js';
import { q } from '../utils/sql.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.post('/', auth, requireRole('admin','supervisor'), async (req, res) => {
  const { lot_id, operation_id, employee_id, pcs, entry_date } = req.body;
  await q(pool, `INSERT INTO production_entries (lot_id, operation_id, employee_id, pcs, entry_date, entered_by)
                 VALUES (?,?,?,?,?,?)`, [lot_id, operation_id, employee_id, pcs, entry_date, req.user.id]);
  res.json({ message: 'Production entry recorded' });
});

router.get('/', auth, requireRole('admin','supervisor','incharge'), async (req, res) => {
  const { from, to, lot_id, employee_id } = req.query;
  const params = [];
  let sql = `SELECT pe.*, lo.op_name, lo.rate_per_piece, e.name as employee_name, l.lot_number
             FROM production_entries pe
             JOIN lot_operations lo ON lo.id = pe.operation_id
             JOIN employees e ON e.id = pe.employee_id
             JOIN lots l ON l.id = pe.lot_id
             WHERE 1=1`;
  if (from) { sql += ' AND pe.entry_date >= ?'; params.push(from); }
  if (to)   { sql += ' AND pe.entry_date <= ?'; params.push(to); }
  if (lot_id) { sql += ' AND pe.lot_id = ?'; params.push(lot_id); }
  if (employee_id) { sql += ' AND pe.employee_id = ?'; params.push(employee_id); }
  sql += ' ORDER BY pe.entry_date DESC, pe.id DESC';
  const rows = await q(pool, sql, params);
  res.json(rows);
});

export default router;
