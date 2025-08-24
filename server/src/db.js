// /opt/dropx/server/src/db.js
import mysql from 'mysql2/promise';

const cfg = {
  host: '127.0.0.1',          // force TCP, avoid socket
  port: 3306,
  user: 'dropx',
  password: 'Souravsingh3614@',
  database: 'dropx_mvp',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
};

// mask password in logs
console.log('[DB] cfg:', { ...cfg, password: '***' });

const pool = mysql.createPool(cfg);

// Export BOTH named and default, so any import style will work.
export { pool };
export default pool;
