const express = require("express");
const db = require("../config/database");
const { verificarAdmin, verificarToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/resenas", async (req, res) => {
  try {
    const [filas] = await db.query(
      `SELECT id, nombre, calificacion, comentario, fecha
       FROM resenas
       WHERE aprobada = 1
       ORDER BY fecha DESC
       LIMIT 50`
    );
    res.json(filas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "No se pudieron cargar las reseñas." });
  }
});

router.post("/resenas", verificarToken, async (req, res) => {
  const { calificacion, comentario } = req.body;
  const nota = Number(calificacion);

  if (!comentario?.trim() || !(nota >= 1 && nota <= 5)) {
    return res.status(400).json({ mensaje: "Datos de reseña inválidos." });
  }

  try {
    let nombre = req.usuario?.nombre;

    if (!nombre && req.usuario?.id) {
      const [[usuario]] = await db.query(
        "SELECT nombre FROM usuarios WHERE id = ?",
        [req.usuario.id]
      );
      nombre = usuario?.nombre;
    }

    if (!nombre?.trim()) {
      return res.status(401).json({ mensaje: "No se pudo identificar al usuario." });
    }

    await db.query(
      `INSERT INTO resenas (nombre, calificacion, comentario, aprobada)
       VALUES (?, ?, ?, 0)`,
      [nombre.trim().slice(0, 80), nota, comentario.trim().slice(0, 400)]
    );
    res.status(201).json({ mensaje: "Reseña recibida." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "No se pudo guardar la reseña." });
  }
});

router.get("/admin/resenas", verificarAdmin, async (req, res) => {
  try {
    const [filas] = await db.query(
      `SELECT id, nombre, calificacion, comentario, aprobada, fecha
       FROM resenas
       ORDER BY fecha DESC`
    );
    res.json(filas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "No se pudieron cargar las reseñas." });
  }
});

router.patch("/admin/resenas/:id", verificarAdmin, async (req, res) => {
  try {
    await db.query("UPDATE resenas SET aprobada = ? WHERE id = ?", [
      req.body.aprobada ? 1 : 0,
      req.params.id,
    ]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "No se pudo actualizar la reseña." });
  }
});

module.exports = router;