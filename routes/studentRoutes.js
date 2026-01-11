const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// ===== THÔNG TIN SINH VIÊN =====
// router.get("/info", studentController.getStudentInfo);

// ===== LỊCH HỌC =====
router.get("/schedule", studentController.getSchedule);

// ===== KẾT QUẢ HỌC TẬP =====
router.get("/grades", studentController.getGrades);


// ===== DANH SÁCH LỚP HỌC PHẦN MỞ =====
router.get("/register/list", studentController.getOpenedCourses);
// ===== CHƯƠNG TRÌNH ĐÀO TẠO =====
router.get("/curriculum", studentController.getCurriculum);

// ===== LỚP ĐÃ ĐĂNG KÝ =====
router.get("/register/my", studentController.getRegisteredCourses);

// ===== LƯU ĐĂNG KÝ =====
router.post("/register/save", studentController.saveRegistration);

// ===== HỦY ĐĂNG KÝ =====
router.post("/register/cancel", studentController.cancelRegistration);
// ===== LỊCH THI =====
router.get("/exam-schedule", studentController.getExamSchedule);

// ===== TRA CỨU HỌC PHẦN =====
router.get("/course-search", studentController.searchCourse);
router.post("/update-profile", studentController.updateStudentProfile);
// router.get('/namhoc', studentController.getNamHoc);
// router.get('/hocky', studentController.getHocKy);


module.exports = router;
