const express = require("express");
const router = express.Router();

const examController = require("../controllers/examController");

router.get("/", examController.getAll);
router.get("/khoa", examController.getKhoa);
router.get("/giamthi", examController.getGiamThi);

router.post("/add", examController.add);
router.put("/update/:id", examController.update);
router.delete("/delete/:id", examController.delete);

module.exports = router;
