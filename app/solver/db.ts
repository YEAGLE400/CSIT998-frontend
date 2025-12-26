import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: '120.26.92.145',
  user: 'root',
  password: 'bbbnnn789', // 曹里林提供的凭据
  database: '998_project',
  port: 3306,
});