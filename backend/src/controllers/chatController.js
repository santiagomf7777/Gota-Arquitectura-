const pool = require("../config/database");
const { procesarMensaje } = require("../services/chatbotService");

async function obtenerCatalogo() {
  const [rows] = await pool.query(`
    SELECT
      p.id,
      p.nombre,
      p.descripcion,
      p.imagen_url,
      m.nombre AS marca,
      c.nombre AS categoria,
      iv.tamano_ml,
      iv.precio,
      iv.stock_actual
    FROM productos p
    LEFT JOIN marcas m ON p.marca_id = m.id
    LEFT JOIN categorias c ON p.categoria_id = c.id
    LEFT JOIN inventario_variantes iv ON p.id = iv.producto_id AND iv.tipo = 'FRASCO'
    WHERE p.estado = 'ACTIVO'
    ORDER BY p.id
  `);

  return rows;
}

async function chat(req, res) {
  const { message, context } = req.body || {};

  if (typeof message !== "string" || message.trim() === "" || message.length > 300) {
    return res.status(400).json({ mensaje: "Mensaje inválido" });
  }

  try {
    const filas = await obtenerCatalogo();
    res.json(procesarMensaje(message, context, filas));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "El asistente no está disponible en este momento.",
    });
  }
}

module.exports = { chat };