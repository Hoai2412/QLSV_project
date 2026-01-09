// routes/dangkylhpRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/dangkylhpController');

router.get('/', controller.getDotDKHP);
router.post('/', controller.createDotDKHP);
router.get('/hocky', controller.getHocKyList);
router.get('/:id', controller.getDotById);      // Lấy chi tiết
router.put('/:id', controller.updateDotDKHP);   // Sửa (Dùng method PUT)
router.delete('/:id', controller.deleteDotDKHP);// Xóa (Dùng method DELETE)

module.exports = router;