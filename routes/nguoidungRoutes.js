// routes/nguoidungRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/nguoidungController');

// --- THÊM PHẦN CẤU HÌNH MULTER ---
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Lưu file vào RAM để xử lý ngay
// ---------------------------------

router.get('/majors', userController.getMajors); 
router.get('/', userController.getUsers);
router.get('/:username', userController.getUserDetail);
router.post('/', userController.createUser);
router.put('/:username', userController.updateUser);
router.delete('/:username', userController.deleteUser);

// --- THÊM ROUTE IMPORT ---
// 'file' là tên name của input trong form upload
router.post('/import', upload.single('file'), userController.importUsersExcel);

module.exports = router;