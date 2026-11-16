require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/database");

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const chatRoutes = require("./routes/chatRoutes");
const adminRoutes = require("./routes/adminRoutes");
const promocionRoutes = require("./routes/promocionRoutes");
const configRoutes = require("./routes/configRoutes");
const resenasRoutes = require("./routes/resenas");
const pqrsRoutes = require("./routes/pqrsRoutes");
const carritoRoutes = require("./routes/carritoRoutes");

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pedidos", orderRoutes);
app.use("/api/admin/inventario", inventoryRoutes);
app.use("/api", resenasRoutes);
app.use("/api", pqrsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/promociones", promocionRoutes);
app.use("/api/config", configRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/carrito", carritoRoutes);

app.get("/", (req, res) => {
  res.json({
    mensaje: "API de Gota Perfumería funcionando",
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS conectado");

    res.json({
      mensaje: "Conexión con MySQL exitosa",
      resultado: rows,
    });
  } catch (error) {
    console.error("Error conectando con MySQL:", error.message);

    res.status(500).json({
      mensaje: "Error conectando con MySQL",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend ejecutándose en el puerto ${PORT}`);
});