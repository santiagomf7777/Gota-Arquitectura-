const pool = require("../config/database");

async function getInventory(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT
        iv.id AS variante_id,
        p.id AS producto_id,
        p.nombre,
        p.imagen_url,
        m.nombre AS marca,
        iv.tamano_ml,
        iv.tipo,
        iv.precio,
        iv.stock_actual,
        iv.stock_minimo
      FROM inventario_variantes iv
      JOIN productos p ON p.id = iv.producto_id
      LEFT JOIN marcas m ON p.marca_id = m.id
      WHERE p.estado = 'ACTIVO'
      ORDER BY p.nombre;
    `);

    const inventario = rows.map((item) => {
      let nivel = "NORMAL";

      if (item.stock_actual <= 0) {
        nivel = "SIN_STOCK";
      } else if (item.stock_actual <= item.stock_minimo / 2) {
        nivel = "CRITICO";
      } else if (item.stock_actual < item.stock_minimo) {
        nivel = "BAJO";
      }

      return {
        ...item,
        valor_total: Number(item.precio) * item.stock_actual,
        nivel,
      };
    });

  const frascos = inventario.filter((i) => i.tipo === "FRASCO");

const resumen = {
  productos_totales: frascos.length,
  stock_normal: frascos.filter((i) => i.nivel === "NORMAL").length,
  stock_bajo: frascos.filter(
    (i) => i.nivel === "BAJO" || i.nivel === "CRITICO"
  ).length,
  sin_stock: frascos.filter((i) => i.nivel === "SIN_STOCK").length,
};

    res.json({ resumen, inventario });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Error obteniendo el inventario",
      error: error.message,
    });
  }
}

module.exports = { getInventory };