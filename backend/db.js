import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kernel_s1',
  waitForConnections: true,
  connectionLimit: 10,

 
  charset: 'utf8mb4_unicode_ci'
});


pool.query("SET NAMES utf8mb4");
pool.query("SET SESSION collation_connection = 'utf8mb4_unicode_ci'");

export default pool;
