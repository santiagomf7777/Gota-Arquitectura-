require("dotenv").config();
const mysql = require("mysql2/promise");

function configuracionSsl() {
  // Aiven usa un certificado propio: pega su contenido completo en DB_SSL_CA
  if (process.env.DB_SSL_CA) {
    return { ca: process.env.DB_SSL_CA.replace(/\\n/g, "\n") };
  }

  if (process.env.DB_SSL === "true") {
    return { rejectUnauthorized: true };
  }

  return undefined;
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "gota_perfumeria",
  charset: "utf8mb4",
  ssl: configuracionSsl(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;