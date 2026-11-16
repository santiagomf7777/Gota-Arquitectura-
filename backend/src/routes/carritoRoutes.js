const express = require("express");
const { calcular } = require("../controllers/carritoController");

const router = express.Router();

router.post("/calcular", calcular);

module.exports = router;