// routes/lophocphanRoutes.js
const express = require('express');
const router = express.Router();
const lhpController = require('../controllers/lophocphanController');
const multer = require('multer');

// Sử dụng memoryStorage để xử lý buffer trực tiếp
const upload = multer({ storage: multer.memoryStorage() });

// Base path: /api (được định nghĩa trong server.js)
router.get('/lophocphan', lhpController.getAllLHP);
router.get('/lophocphan/metadata', lhpController.getMetadata);
router.post('/lophocphan', lhpController.createLHP);
router.put('/lophocphan', lhpController.updateLHP);
router.delete('/lophocphan/:id', lhpController.deleteLHP);
router.post('/lophocphan/import', upload.single('file'), lhpController.importExcel);

module.exports = router;