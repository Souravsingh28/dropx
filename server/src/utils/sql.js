// /opt/dropx/server/src/utils/sql.js
import { pool as sharedPool } from '../db.js';

// Call like: await q(pool, 'SELECT ...', [params])
// or: await q(null, 'SELECT ...') to use the shared pool
export async function q(poolOrNull, sql, params = []) {
  const p = poolOrNull?.query ? poolOrNull : sharedPool;
  const [rows] = await p.query(sql, params);
  return rows;
}
