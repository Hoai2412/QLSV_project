// controllers/authController.js
const db = require("../config/db");
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
    const { username, password, role } = req.body;

    console.log("Đăng nhập:", username, role);

    // 1. CHUYỂN ĐỔI ROLE TỪ FRONTEND SANG DATABASE
    // Form gửi: sv, gv, admin -> DB: SinhVien, GiangVien, Admin
    let dbRole = role;
    if (role === 'sv') dbRole = 'SinhVien';
    else if (role === 'gv') dbRole = 'GiangVien';
    else if (role === 'admin') dbRole = 'Admin';

    try {
        // 2. TÌM USER THEO USERNAME VÀ ROLE ĐÃ CHUYỂN ĐỔI
        const [rows] = await db.execute(
            "SELECT * FROM taikhoan WHERE Username = ? AND VaiTro = ? LIMIT 1",
            [username, dbRole]
        );

        if (rows.length === 0) {
            return res.json({ success: false, message: "Tài khoản không tồn tại hoặc sai vai trò" });
        }

        const user = rows[0];

        // 3. KIỂM TRA TRẠNG THÁI
        if (user.TrangThai === 'Locked') {
            return res.json({ success: false, message: "Tài khoản đã bị KHÓA" });
        }

        // 4. KIỂM TRA MẬT KHẨU (THÔNG MINH)
        let match = false;
        
        // Cách 1: Thử so sánh bằng Bcrypt (dành cho tk mới hoặc đã đổi pass)
        match = await bcrypt.compare(password, user.MatKhauHash);

        // Cách 2: Nếu thất bại, thử so sánh thô (dành cho tk cũ chưa mã hóa)
        if (!match && password === user.MatKhauHash) {
            match = true;
            console.log("--> Đăng nhập bằng mật khẩu cũ (chưa mã hóa)");
        }

        if (!match) {
            return res.json({ success: false, message: "Sai mật khẩu" });
        }

        // 5. TẠO SESSION
        let redirect = "/";
        if (user.VaiTro === "SinhVien") {
            req.session.user = { Username: user.Username, VaiTro: user.VaiTro, MaSV: user.MaSV };
            redirect = "/student";
        } else if (user.VaiTro === "GiangVien") {
            const [gvRows] = await db.execute("SELECT HoTen FROM giangvien WHERE MaGV = ?", [user.MaGV]);
            req.session.giangvien = { Username: user.Username, MaGV: user.MaGV, HoTen: gvRows[0]?.HoTen || "" };
            redirect = "/giangvien"; // Cần đảm bảo route này tồn tại hoặc redirect về trang phù hợp
        } else if (user.VaiTro === "Admin") {
            req.session.admin = { Username: user.Username };
            redirect = "/admin/dashboard";
        }

        return res.json({ success: true, redirect });

    } catch (err) {
        console.error("Lỗi login:", err);
        return res.json({ success: false, message: "Lỗi server: " + err.message });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => { res.json({ success: true }); });
};