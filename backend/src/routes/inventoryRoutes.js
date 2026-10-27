const express = require("express");
const router = express.Router();
const { getInventory } = require("../controllers/inventoryController");
const { verificarAdmin } = require("../middleware/authMiddleware");

router.get("/", verificarAdmin, getInventory);

module.exports = router;