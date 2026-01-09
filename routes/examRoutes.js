const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");

router.get("/", examController.getAll);
router.get("/:id", examController.getById);

router.post("/", examController.add);
router.put("/:id", examController.update);
router.delete("/:id", examController.delete);

// COMBOBOX
router.get("/hocky/form", examController.getHocKyForm);
router.get("/hocky/all", examController.getHocKyAll);
router.get("/phonghoc/list", examController.getPhongHoc);
router.get("/giamthi/list", examController.getGiamThi);
router.get("/khoa/list", examController.getKhoaList);
router.get("/monhoc/:maKhoa", examController.getMonByKhoa);
router.post("/check-trung", examController.checkTrungLichThi);
router.get("/khoa-by-mon", examController.getKhoaByMon);




module.exports = router;
