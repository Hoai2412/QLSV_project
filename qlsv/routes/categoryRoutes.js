// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const catController = require('../controllers/categoryController');

// Routes KHOA
router.get('/khoa', catController.getKhoa);
router.post('/khoa', catController.createKhoa);
router.put('/khoa/:id', catController.updateKhoa);
router.delete('/khoa/:id', catController.deleteKhoa);

// Routes NGÀNH
router.get('/nganh', catController.getNganh);
router.post('/nganh', catController.createNganh);
router.put('/nganh/:id', catController.updateNganh);
router.delete('/nganh/:id', catController.deleteNganh);

// Routes MÔN HỌC
router.get('/mon', catController.getMon);
router.post('/mon', catController.createMon);
router.put('/mon/:id', catController.updateMon);
router.delete('/mon/:id', catController.deleteMon);

module.exports = router;