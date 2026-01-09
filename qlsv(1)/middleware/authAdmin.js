// middleware/authAdmin.js
module.exports = function authAdmin(req, res, next) {
    // Ở đây giả sử bạn đã gán thông tin user vào req.user
    // (ví dụ sau khi verify JWT hoặc session)
    if (!req.user) {
        return res.redirect('/login.html');
    }

    if (req.user.VaiTro !== 'Admin') {
        // Không phải admin thì đá về trang sinh viên/giảng viên tùy role
        if (req.user.VaiTro === 'SinhVien') {
            return res.redirect('/students/dashboard');
        }
        if (req.user.VaiTro === 'GiangVien') {
            return res.redirect('/giangvien/dashboard');
        }
        return res.status(403).send('Forbidden');
    }

    next();
};
