const express = require("express");
const cors = require("cors");
const pool = require("./config/database");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

app.use(cors());
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
    console.error(error);
    res.status(500).json({
      mensaje: "Error conectando con MySQL",
      error: error.message
    });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Backend ejecutándose en http://localhost:${PORT}`);
});