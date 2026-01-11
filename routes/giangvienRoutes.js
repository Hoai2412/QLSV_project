// routes/giangvienRoutes.js
const express = require("express");
const router = express.Router();
const path = require("path");
const requireGV = require("../middleware/authGV");
const gvController = require("../controllers/giangvienController");

// ===== PAGE =====
router.get("/", requireGV, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/views/giangvien/gv-dashboard.html"));
});

router.get("/lophocphan", requireGV, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/views/giangvien/gv-lophocphan.html"));
});

router.get("/lophocphan/detail", requireGV, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/views/giangvien/gv-lophocphan-detail.html"));
});

router.get("/lichday", requireGV, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/views/giangvien/gv-lichday.html"));
});
// ===== PAGE =====
router.get("/lichthi", requireGV, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/views/giangvien/gv-lichthi.html"));
});


router.get("/nhatky", requireGV, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/views/giangvien/gv-nhatky-diem.html"));
});
// PAGE Nhập điểm
router.get("/nhapdiem", requireGV, (req, res) => {
    res.sendFile(
        path.join(__dirname, "../public/views/giangvien/gv-nhapdiem.html")
    );
});


// ===== API (KHÔNG requireGV – controller tự check) =====
router.get("/api/info", gvController.getInfo);
router.get("/api/dashboard-stats", gvController.getDashboardStats);
router.get("/api/lophocphan", gvController.getLopHocPhan);
router.get("/api/lichday", gvController.getLichDay);
router.get("/api/lichthi", gvController.getLichThi);
router.get("/api/lophocphan/:MaLHP/sinhvien", gvController.getSinhVienTrongLop);
router.get("/api/nhatky/:BangDiemID", gvController.getNhatKyDiem);
router.post("/api/bangdiem/save", gvController.saveBangDiem);

module.exports = router;
