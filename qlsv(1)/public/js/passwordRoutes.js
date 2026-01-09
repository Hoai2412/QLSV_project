// routes/passwordRoutes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/passwordController");

router.post("/send-otp", ctrl.sendOtp);
router.post("/verify-otp", ctrl.verifyOtp);
router.post("/reset", ctrl.resetPassword);

module.exports = router;