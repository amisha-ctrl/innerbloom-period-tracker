const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware.js");
const { userPeriodEntry, getDashboardData } = require("../controllers/periodLogController.js");

router.post("/periodEntry", authMiddleware, userPeriodEntry);
router.get("/dashboard", authMiddleware, getDashboardData);

module.exports = router;