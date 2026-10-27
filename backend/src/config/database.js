const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Gota123.",
  database: "gota_perfumeria",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;