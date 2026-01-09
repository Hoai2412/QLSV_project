const db = require("../config/db");

// =========================
// LẤY TẤT CẢ USER
// =========================
exports.getUsers = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                tk.Username,
                tk.VaiTro,
                tk.TrangThai,
                COALESCE(sv.HoTen, gv.HoTen, 'Admin') AS HoTen
            FROM taikhoan tk
            LEFT JOIN sinhvien sv ON tk.MaSV = sv.MaSV
            LEFT JOIN giangvien gv ON tk.MaGV = gv.MaGV
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
};

// =========================
// TÌM KIẾM USER
// =========================
exports.searchUsers = async (req, res) => {
    const keyword = `%${req.query.key}%`;

    try {
        const [rows] = await db.query(`
            SELECT 
                tk.Username,
                tk.VaiTro,
                tk.TrangThai,
                COALESCE(sv.HoTen, gv.HoTen, 'Admin') AS HoTen
            FROM taikhoan tk
            LEFT JOIN sinhvien sv ON tk.MaSV = sv.MaSV
            LEFT JOIN giangvien gv ON tk.MaGV = gv.MaGV
            WHERE tk.Username LIKE ? OR sv.HoTen LIKE ? OR gv.HoTen LIKE ?
        `, [keyword, keyword, keyword]);

        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
};

// =========================
// THÊM USER + TỰ ĐỘNG THÊM SINHVIEN / GIANGVIEN
// =========================
exports.addUser = async (req, res) => {
    const { Username, MatKhauHash, VaiTro, HoTen } = req.body;

    try {
        // 1. Nếu là sinh viên → thêm vào bảng sinhvien
        if (VaiTro === "SinhVien") {
            await db.query(
                `INSERT INTO sinhvien (MaSV, HoTen, MaNganh, Lop, KhoaHoc, TrangThai)
                 VALUES (?, ?, 'CNTT', 'Chưa xếp lớp', 44, 'DangHoc')`,
                [Username, HoTen]
            );
        }

        // 2. Nếu là giảng viên → thêm vào bảng giangvien
        if (VaiTro === "GiangVien") {
            await db.query(
                `INSERT INTO giangvien (MaGV, HoTen, TrangThai)
                 VALUES (?, ?, 'Active')`,
                [Username, HoTen]
            );
        }

        // 3. Thêm vào bảng tài khoản
        await db.query(
            `INSERT INTO taikhoan (Username, MatKhauHash, VaiTro, MaSV, MaGV, TrangThai)
             VALUES (?, ?, ?, 
                IF(?='SinhVien', ?, NULL),
                IF(?='GiangVien', ?, NULL),
                'Active')`,
            [Username, MatKhauHash, VaiTro, VaiTro, Username, VaiTro, Username]
        );

        res.json({ message: "Thêm người dùng thành công!" });

    } catch (err) {
        console.error("Lỗi thêm user:", err);
        res.status(500).json(err);
    }
};

// =========================
// CẬP NHẬT USER
// =========================
exports.updateUser = async (req, res) => {
    const username = req.params.username;
    const { VaiTro, TrangThai } = req.body;

    try {
        await db.query(`
            UPDATE taikhoan
            SET VaiTro=?, TrangThai=?
            WHERE Username=?
        `, [VaiTro, TrangThai, username]);

        res.json({ message: "Cập nhật thành công!" });

    } catch (err) {
        res.status(500).json(err);
    }
};

// =========================
// XÓA USER (CÓ XÓA SINHVIEN / GIANGVIEN LUÔN)
// =========================
exports.deleteUser = async (req, res) => {
    const username = req.params.username;

    try {
        // Xóa sinh viên
        await db.query(`DELETE FROM sinhvien WHERE MaSV=?`, [username]);

        // Xóa giảng viên
        await db.query(`DELETE FROM giangvien WHERE MaGV=?`, [username]);

        // Xóa tài khoản
        await db.query(`DELETE FROM taikhoan WHERE Username=?`, [username]);

        res.json({ message: "Xóa thành công!" });

    } catch (err) {
        res.status(500).json(err);
    }
};
