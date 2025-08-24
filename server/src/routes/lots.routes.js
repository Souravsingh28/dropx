import { Router } from 'express';
import { pool } from '../db.js';
import { q } from '../utils/sql.js';
import requireAuth from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';

const router = Router();

/** Run a function inside a MySQL transaction and auto-commit/rollback */
async function withTx(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const out = await fn(conn);
    await conn.commit();
    return out;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/**
 * POST /api/lots
 * Body: {
 *   lot_number: string,
 *   target_qty?: number|null,
 *   operations: [{ op_name: string, rate_per_piece: number }, ...]
 * }
 * Creates a lot and its operations atomically.
 */
router.post(
  '/',
  requireAuth,
  requireRole('admin', 'supervisor', 'incharge'),
  async (req, res) => {
    try {
      let { lot_number, target_qty, operations } = req.body || {};
      lot_number = (lot_number || '').trim();
      if (!lot_number) return res.status(400).json({ error: 'lot_number is required' });

      const target =
        target_qty === '' || target_qty === null || target_qty === undefined
          ? null
          : Number(target_qty);
      if (target !== null && (Number.isNaN(target) || target < 0)) {
        return res.status(400).json({ error: 'target_qty must be a positive number or empty' });
      }

      if (!Array.isArray(operations) || operations.length === 0) {
        return res.status(400).json({ error: 'At least one operation is required' });
      }
      for (const op of operations) {
        const name = (op.op_name || '').trim();
        const rate = Number(op.rate_per_piece);
        if (!name) return res.status(400).json({ error: 'op_name is required for all operations' });
        if (!Number.isFinite(rate) || rate <= 0) {
          return res.status(400).json({ error: 'rate_per_piece must be a positive number for all operations' });
        }
      }

      const result = await withTx(async (conn) => {
        const [r1] = await conn.query(
          'INSERT INTO lots (lot_number, target_qty) VALUES (?, ?)',
          [lot_number, target]
        );
        const lotId = r1.insertId;

        const values = operations.map((op) => [
          lotId,
          op.op_name.trim(),
          Number(op.rate_per_piece),
        ]);
        // Bulk insert
        await conn.query(
          'INSERT INTO lot_operations (lot_id, op_name, rate_per_piece) VALUES ?',
          [values]
        );

        return { lotId };
      });

      res.json({ message: 'Lot created', id: result.lotId });
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'lot_number already exists' });
      }
      console.error('Create lot error:', e);
      res.status(500).json({ error: 'Server error creating lot' });
    }
  }
);

/**
 * GET /api/lots
 *   /api/lots?with_ops=1  → embeds operations per lot
 */
router.get(
  '/',
  requireAuth,
  requireRole('admin', 'supervisor', 'incharge', 'worker'),
  async (req, res) => {
    try {
      const withOps = String(req.query.with_ops || '') === '1';

      const lots = await q(
        pool,
        'SELECT id, lot_number, target_qty, created_at FROM lots ORDER BY created_at DESC'
      );

      if (!withOps || lots.length === 0) return res.json(lots);

      const ids = lots.map((l) => l.id);
      const ops = await q(
        pool,
        'SELECT id, lot_id, op_name, rate_per_piece FROM lot_operations WHERE lot_id IN (?) ORDER BY id ASC',
        [ids]
      );

      const byLot = {};
      for (const op of ops) {
        (byLot[op.lot_id] ||= []).push(op);
      }
      const merged = lots.map((l) => ({ ...l, operations: byLot[l.id] || [] }));
      res.json(merged);
    } catch (e) {
      console.error('GET /lots error:', e);
      res.status(500).json({ error: 'Failed to load lots' });
    }
  }
);

/**
 * GET /api/lots/:lotId/operations
 * Returns an array of operations for a lot.
 */
router.get(
  '/:lotId/operations',
  requireAuth,
  requireRole('admin', 'supervisor', 'incharge', 'worker'),
  async (req, res) => {
    try {
      const lotId = Number(req.params.lotId);
      if (!Number.isFinite(lotId)) {
        return res.status(400).json({ error: 'Invalid lot id' });
      }
      const rows = await q(
        pool,
        'SELECT id, op_name, rate_per_piece FROM lot_operations WHERE lot_id=? ORDER BY id ASC',
        [lotId]
      );
      return res.json(rows);
    } catch (e) {
      console.error('Get lot operations error:', e);
      return res.status(500).json({ error: 'Failed to load operations' });
    }
  }
);

/**
 * PUT /api/lots/:id
 * Updates lot fields and REPLACES operations atomically.
 * Body: { lot_number, target_qty, operations:[{op_name, rate_per_piece}, ...] }
 */
router.put(
  '/:id',
  requireAuth,
  requireRole('admin', 'supervisor', 'incharge'),
  async (req, res) => {
    try {
      const lotId = Number(req.params.id);
      if (!Number.isFinite(lotId)) return res.status(400).json({ error: 'Invalid lot id' });

      let { lot_number, target_qty, operations } = req.body || {};
      lot_number = (lot_number || '').trim();
      if (!lot_number) return res.status(400).json({ error: 'lot_number is required' });

      const target =
        target_qty === '' || target_qty === null || target_qty === undefined
          ? null
          : Number(target_qty);
      if (target !== null && (Number.isNaN(target) || target < 0)) {
        return res.status(400).json({ error: 'target_qty must be a positive number or empty' });
      }

      if (!Array.isArray(operations) || operations.length === 0) {
        return res.status(400).json({ error: 'At least one operation is required' });
      }
      for (const op of operations) {
        const name = (op.op_name || '').trim();
        const rate = Number(op.rate_per_piece);
        if (!name) return res.status(400).json({ error: 'op_name is required for all operations' });
        if (!Number.isFinite(rate) || rate <= 0) {
          return res.status(400).json({ error: 'rate_per_piece must be a positive number for all operations' });
        }
      }

      await withTx(async (conn) => {
        await conn.query('UPDATE lots SET lot_number=?, target_qty=? WHERE id=?', [
          lot_number, target, lotId
        ]);
        await conn.query('DELETE FROM lot_operations WHERE lot_id=?', [lotId]);

        const values = operations.map((op) => [
          lotId,
          op.op_name.trim(),
          Number(op.rate_per_piece),
        ]);
        await conn.query(
          'INSERT INTO lot_operations (lot_id, op_name, rate_per_piece) VALUES ?',
          [values]
        );
      });

      res.json({ message: 'Lot updated' });
    } catch (e) {
      console.error('Update lot error:', e);
      res.status(500).json({ error: 'Server error updating lot' });
    }
  }
);

/**
 * GET /api/lots/progress
 * For each lot:
 *   completed_pcs = MIN over its operations of SUM(pcs) done per operation (0 if none)
 *   progress_pct  = completed_pcs / target_qty (if target set)
 */
router.get(
  '/progress',
  requireAuth,
  requireRole('admin','supervisor','incharge','worker'),
  async (_req, res) => {
    try {
      const sql = `
        SELECT
          l.id,
          l.lot_number,
          l.target_qty,
          COALESCE(MIN(COALESCE(pe.op_pcs, 0)), 0) AS completed_pcs,
          CASE
            WHEN l.target_qty IS NULL OR l.target_qty = 0 THEN NULL
            ELSE ROUND(100 * COALESCE(MIN(COALESCE(pe.op_pcs,0)),0) / l.target_qty, 2)
          END AS progress_pct
        FROM lots l
        LEFT JOIN lot_operations lo
          ON lo.lot_id = l.id
        LEFT JOIN (
          SELECT operation_id, SUM(pcs) AS op_pcs
          FROM production_entries
          GROUP BY operation_id
        ) pe
          ON pe.operation_id = lo.id
        GROUP BY l.id, l.lot_number, l.target_qty
        ORDER BY l.created_at DESC
      `;
      const rows = await q(pool, sql);
      return res.json(rows);
    } catch (e) {
      console.error('Lot progress error:', e);
      return res.status(500).json({ error: 'Failed to compute lot progress' });
    }
  }
);

/**
 * GET /api/lots/:lotId/progress
 * Progress for a single lot (same logic as above but filtered).
 */
router.get(
  '/:lotId/progress',
  requireAuth,
  requireRole('admin','supervisor','incharge','worker'),
  async (req, res) => {
    try {
      const lotId = Number(req.params.lotId);
      if (!Number.isFinite(lotId)) return res.status(400).json({ error: 'Invalid lot id' });

      const sql = `
        SELECT
          l.id,
          l.lot_number,
          l.target_qty,
          COALESCE(MIN(COALESCE(pe.op_pcs, 0)), 0) AS completed_pcs,
          CASE
            WHEN l.target_qty IS NULL OR l.target_qty = 0 THEN NULL
            ELSE ROUND(100 * COALESCE(MIN(COALESCE(pe.op_pcs,0)),0) / l.target_qty, 2)
          END AS progress_pct
        FROM lots l
        LEFT JOIN lot_operations lo
          ON lo.lot_id = l.id
        LEFT JOIN (
          SELECT operation_id, SUM(pcs) AS op_pcs
          FROM production_entries
          WHERE lot_id = ?
          GROUP BY operation_id
        ) pe
          ON pe.operation_id = lo.id
        WHERE l.id = ?
        GROUP BY l.id, l.lot_number, l.target_qty
        LIMIT 1
      `;
      const rows = await q(pool, sql, [lotId, lotId]);
      if (!rows.length) return res.status(404).json({ error: 'Lot not found' });
      return res.json(rows[0]);
    } catch (e) {
      console.error('Lot progress (single) error:', e);
      return res.status(500).json({ error: 'Failed to compute lot progress' });
    }
  }
);

export default router;
