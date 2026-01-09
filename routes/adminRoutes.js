// routes/adminRoutes.js
const express = require('express');
const path = require('path');
const router = express.Router();

// Sau này muốn check quyền admin thì chèn middleware vào giữa: authAdmin,
router.get(['/', '/dashboard'], (req, res) => {
    // Nếu admin-dashboard.html nằm trong public/views/admin
    res.sendFile(
        path.join(__dirname, '..', 'public', 'views', 'admin', 'admin-dashboard.html')
    );
});

router.get('/category', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'views', 'admin', 'category.html'));
});
router.get('/diem', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'views', 'admin', 'diem.html'));
});
router.get("/diem/history", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "views", "admin", "diemHistory.html"));
});


module.exports = router;
