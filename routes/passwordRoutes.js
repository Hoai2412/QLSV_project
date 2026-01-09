const express = require('express');
const router = express.Router();

const passwordController = require('../controllers/passwordController');

// ===== QUÊN MẬT KHẨU =====
router.post('/forgot', passwordController.sendOtp);     // ⚠️ sendOtp (KHỚP LOG)
router.post('/verify', passwordController.verifyOtp);
router.post('/reset', passwordController.resetPassword);

module.exports = router;
