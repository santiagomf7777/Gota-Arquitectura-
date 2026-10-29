const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET;

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      mensaje: "Correo y contraseña son obligatorios",
    });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, nombre, email, password_hash, rol FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        mensaje: "Credenciales inválidas",
      });
    }

    const usuario = rows[0];

    const passwordValida = await bcrypt.compare(
      password,
      usuario.password_hash
    );

    if (!passwordValida) {
      return res.status(401).json({
        mensaje: "Credenciales inválidas",
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Error en el servidor al iniciar sesión",
      error: error.message,
    });
  }
}

async function register(req, res) {
  const { nombre, email, password, telefono } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({
      mensaje: "Nombre, correo y contraseña son obligatorios",
    });
  }

  try {
    const [existentes] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (existentes.length > 0) {
      return res.status(409).json({
        mensaje: "Ya existe una cuenta con ese correo",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [resultado] = await pool.query(
      "INSERT INTO usuarios (nombre, email, password_hash, telefono, rol) VALUES (?, ?, ?, ?, 'CLIENTE')",
      [nombre, email, passwordHash, telefono || null]
    );

    const token = jwt.sign(
      {
        id: resultado.insertId,
        email,
        rol: "CLIENTE",
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(201).json({
      mensaje: "Cuenta creada exitosamente",
      token,
      usuario: {
        id: resultado.insertId,
        nombre,
        email,
        rol: "CLIENTE",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Error en el servidor al crear la cuenta",
      error: error.message,
    });
  }
}

module.exports = { login, register };