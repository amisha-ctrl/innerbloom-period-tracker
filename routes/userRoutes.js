const express = require("express");
const router = express.Router();
const { signup, login, profile, deleteUser, editUser, refreshLocation, resetLink, resetPassword } = require("../controllers/userController.js");
const authMiddleware = require("../middleware/authMiddleware.js");

router.post("/signup", signup);
router.post("/login", login)
router.get("/profile", authMiddleware, profile);
router.delete("/delete-account", authMiddleware, deleteUser);
router.put("/update-info", authMiddleware, editUser);
router.put("/new-location", authMiddleware, refreshLocation);
router.post("/reset-link", resetLink);
router.post("/reset-password", resetPassword);

module.exports = router;