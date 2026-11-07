
require("dotenv").config();

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const caPath = path.join(__dirname, "../../aiven-ca.pem");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "gota_perfumeria",

  ssl: process.env.DB_SSL === "true"
    ? {
        ca: fs.readFileSync(caPath),
        rejectUnauthorized: true
      }
    : undefined,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;

