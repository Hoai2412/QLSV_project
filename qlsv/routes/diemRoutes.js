const express = require("express");
const router = express.Router();
const diemController = require("../controllers/diemController");

router.get("/", diemController.getAllScores);
router.get("/search", diemController.searchScore);

router.post("/update", diemController.updateScore);  // DÒNG 8

router.post("/lock", diemController.lockScore);
router.post("/lockall", diemController.lockAllScores);
router.post("/unlockall", diemController.unlockAllScores);

router.get("/history", diemController.getHistory);

module.exports = router;
