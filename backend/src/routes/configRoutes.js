const express = require("express");
const pool = require("../config/database");

const router = express.Router();

const CLAVES_PUBLICAS = [
  "tienda_nombre",
  "tienda_email",
  "tienda_telefono",
  "envio_costo",
  "envio_gratis_desde",
];

router.get("/tienda", async (req, res) => {
  try {
    const [filas] = await pool.query(
      "SELECT clave, valor FROM configuracion WHERE clave IN (?)",
      [CLAVES_PUBLICAS]
    );

    const salida = Object.fromEntries(filas.map((f) => [f.clave, f.valor]));
    res.json(salida);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error obteniendo datos de la tienda" });
  }
});

module.exports = router;