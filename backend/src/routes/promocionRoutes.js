const express = require("express");
const pool = require("../config/database");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [promos] = await pool.query(
      `SELECT id, nombre, descripcion, tipo, valor, precio_combo
       FROM promociones
       WHERE activa = 1
         AND (fecha_inicio IS NULL OR fecha_inicio <= NOW())
         AND (fecha_fin IS NULL OR fecha_fin >= NOW())
       ORDER BY fecha_creacion DESC`
    );

    if (promos.length === 0) return res.json([]);

    const [items] = await pool.query(
      `SELECT i.promocion_id, i.cantidad, i.es_regalo,
              v.id AS variante_id, v.tipo, v.tamano_ml, v.precio,
              pr.id AS producto_id, pr.nombre
       FROM promocion_items i
       JOIN inventario_variantes v ON v.id = i.variante_id
       JOIN productos pr ON pr.id = v.producto_id
       WHERE i.promocion_id IN (?) AND pr.estado = 'ACTIVO'
       ORDER BY i.promocion_id, i.es_regalo, v.tamano_ml`,
      [promos.map((p) => p.id)]
    );

    res.json(
      promos.map((p) => ({
        ...p,
        items: items
          .filter((i) => i.promocion_id === p.id)
          .map((i) => ({
            variante_id: i.variante_id,
            producto_id: i.producto_id,
            nombre: i.nombre,
            tipo: i.tipo,
            tamano_ml: i.tamano_ml,
            precio: i.precio,
            cantidad: Number(i.cantidad) || 1,
            es_regalo: Number(i.es_regalo) === 1,
          })),
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error obteniendo promociones" });
  }
});

module.exports = router;