const express = require("express");
const router = express.Router();
const controller = require("../controllers/baocaoController");

router.get("/thongke", controller.getThongKe);
router.get("/filters", controller.getFilters);

// ✅ EXPORT
router.get("/export-excel", controller.exportExcel);
router.get("/export-pdf", controller.exportPDF);

module.exports = router;
