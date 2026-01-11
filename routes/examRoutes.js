const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");

// ====== ROUTE TĨNH ĐẶT TRƯỚC ======
router.get("/hocky/form", examController.getHocKyForm);
router.get("/hocky/all", examController.getHocKyAll);

router.get("/phonghoc/list", examController.getPhongHoc);
router.get("/giamthi/list", examController.getGiamThi);

router.get("/khoa/list", examController.getKhoaList);
router.get("/monhoc/:maKhoa", examController.getMonByKhoa);

// ✅ phải đặt route query trước route params
router.get("/lophocphan", examController.getLopHocPhanByHocKyKhoa);
router.get("/lophocphan/:hocKy", examController.getLopHocPhanByHocKy);

router.post("/check-trung", examController.checkTrungLichThi);

router.get("/", examController.getAll);
router.post("/", examController.add);

// ====== ROUTE PARAM ĐẶT SAU CÙNG ======
router.get("/:id", examController.getById);
router.put("/:id", examController.update);
router.delete("/:id", examController.delete);

module.exports = router;
