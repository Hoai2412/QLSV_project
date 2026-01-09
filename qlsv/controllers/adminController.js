// controllers/adminController.js
const path = require('path');

exports.getDashboard = (req, res) => {
    const filePath = path.join(__dirname, '..', 'views', 'admin', 'admin-dashboard.html');
    return res.sendFile(filePath);
};
