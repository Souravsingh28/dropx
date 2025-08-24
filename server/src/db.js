import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1', // force TCP, not socket
  user: process.env.MYSQL_USER,                // "dropx"
  password: process.env.MYSQL_PASSWORD,        // "Souravsingh3614@"
  database: process.env.MYSQL_DB,              // "dropx_mvp"
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
});
