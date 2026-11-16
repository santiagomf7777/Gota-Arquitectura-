const pool = require("../config/database");

const TIPOS = ["PETICION", "QUEJA", "RECLAMO", "SUGERENCIA"];

exports.crearPqrs = async (req, res) => {
  const { tipo, nombre, email, telefono, pedido_codigo, asunto, mensaje } = req.body;

  if (!TIPOS.includes(tipo) || !nombre?.trim() || !email?.trim() || !asunto?.trim() || !mensaje?.trim()) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios." });
  }

  try {
    await pool.query(
      `INSERT INTO pqrs (tipo, nombre, email, telefono, pedido_codigo, asunto, mensaje)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        tipo,
        nombre.trim().slice(0, 120),
        email.trim().slice(0, 160),
        telefono?.trim().slice(0, 30) || null,
        pedido_codigo?.trim().slice(0, 40) || null,
        asunto.trim().slice(0, 200),
        mensaje.trim(),
      ]
    );
    res.status(201).json({ mensaje: "PQRS recibida." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "No se pudo guardar la solicitud." });
  }
};

exports.listarPqrs = async (req, res) => {
  try {
    const [filas] = await pool.query(
      `SELECT id, tipo, nombre, email, telefono, pedido_codigo, asunto, mensaje, estado, creado_en
       FROM pqrs ORDER BY creado_en DESC`
    );
    res.json(filas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "No se pudieron cargar las PQRS." });
  }
};

exports.actualizarEstado = async (req, res) => {
  const { estado } = req.body;
  if (!["NUEVO", "EN_PROCESO", "RESUELTO"].includes(estado)) {
    return res.status(400).json({ mensaje: "Estado inválido." });
  }

  try {
    await pool.query("UPDATE pqrs SET estado = ? WHERE id = ?", [estado, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "No se pudo actualizar el estado." });
  }
};