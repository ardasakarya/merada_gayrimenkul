const mysql = require("mysql2");
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,   // havuzda max bağlantı
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL bağlantı hatası:", err);
    process.exit(1);
  }
  if (connection) connection.release();
  console.log("✅ MySQL Pool bağlantısı başarılı");
});

module.exports = pool;
