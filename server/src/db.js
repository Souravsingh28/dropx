import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: '127.0.0.1',                   // <— force TCP (not localhost)
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  port: Number(process.env.MYSQL_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
});
