// /opt/dropx/server/src/db.js
import mysql from 'mysql2/promise';

const cfg = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
};

// TEMP diag: show what we actually use (no password).
console.log('[DB] cfg:', { ...cfg, password: cfg.password ? '***' : '(empty)' });

export const pool = mysql.createPool(cfg);
