const pool = require("../config/database");
const { procesarMensaje } = require("../services/chatbotService");
const { obtenerPromocionesActivas } = require("../utils/promociones");

async function obtenerCatalogo() {
  const [rows] = await pool.query(`
    SELECT
      p.id,
      p.nombre,
      p.descripcion,
      p.imagen_url,
      m.nombre AS marca,
      c.nombre AS categoria,

      -- Información descriptiva de detalle_perfumes
      d.familia_olfativa,
      d.concentracion,
      d.notas_salida,
      d.notas_corazon,
      d.notas_fondo,
      d.rendimiento,
      d.uso_ideal,
      d.publico_objetivo,
      d.descripcion_corta,
      d.descripcion_chatbot,
      d.observaciones,

      -- Información comercial de todas las variantes
      iv.id AS variante_id,
      iv.tamano_ml,
      iv.tipo,
      iv.precio,
      iv.stock_actual

    FROM productos p

    LEFT JOIN marcas m
      ON p.marca_id = m.id

    LEFT JOIN categorias c
      ON p.categoria_id = c.id

    LEFT JOIN detalle_perfumes d
      ON p.id = d.producto_id

    LEFT JOIN inventario_variantes iv
      ON p.id = iv.producto_id

    WHERE p.estado = 'ACTIVO'

    ORDER BY p.id, iv.tamano_ml
  `);

  return rows;
}

async function chat(req, res) {
  const { message, context } = req.body || {};

  if (
    typeof message !== "string" ||
    message.trim() === "" ||
    message.length > 300
  ) {
    return res.status(400).json({
      mensaje: "Mensaje inválido",
    });
  }

  try {
    const [filas, promos] = await Promise.all([
      obtenerCatalogo(),
      obtenerPromocionesActivas(),
    ]);

    res.json(procesarMensaje(message, context, filas, promos));
  } catch (error) {
    console.error("Error en chatbot:", error);

    res.status(500).json({
      mensaje: "El asistente no está disponible en este momento.",
    });
  }
}

module.exports = { chat };