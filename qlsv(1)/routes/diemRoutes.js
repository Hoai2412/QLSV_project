// routes/diemRoutes.js
const express = require("express");
const router = express.Router();
const diemController = require("../controllers/diemController");

// vì server.js đã app.use("/api/diem", ...) rồi
router.get("/lophocphan", diemController.getLopHocPhanForAdmin);
router.post("/lophocphan/toggle", diemController.toggleSoDiem);
router.get("/lophocphan/:MaLHP/history", diemController.getLichSuDiemTheoLHP);

module.exports = router;
