const express = require("express");
const { verificarAdmin, verificarToken } = require("../middleware/authMiddleware");
const { crearPqrs, listarPqrs, actualizarEstado } = require("../controllers/pqrsController");

const router = express.Router();

router.post("/pqrs", verificarToken, crearPqrs);
router.get("/admin/pqrs", verificarAdmin, listarPqrs);
router.patch("/admin/pqrs/:id", verificarAdmin, actualizarEstado);

module.exports = router;