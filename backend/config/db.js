const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4"
});

// bağlantı test
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ MySQL Pool bağlantısı başarılı");
    conn.release();
  } catch (err) {
    console.error("❌ MySQL bağlantı hatası:", err);
    process.exit(1);
  }
})();

module.exports = pool;
