import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: '120.26.92.145', 
  user: 'your_username', // 替换为真实用户名
  password: 'your_password', // 替换为真实密码
  database: 'your_database', 
  waitForConnections: true,
  connectionLimit: 10
});