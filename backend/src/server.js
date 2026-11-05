
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/database");

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map(origin => origin.trim())
  : ["http://localhost:5173"];

app.use(cors({
  origin: allowedOrigins
}));

app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pedidos", orderRoutes);
app.use("/api/admin/inventario", inventoryRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.json({
    mensaje: "API de Gota Perfumería funcionando"
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS conectado");

    res.json({
      mensaje: "Conexión con MySQL exitosa",
      resultado: rows
    });
  } catch (error) {
    console.error("Error conectando con MySQL:", error.message);

    res.status(500).json({
      mensaje: "Error conectando con MySQL"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend ejecutándose en el puerto ${PORT}`);
});
