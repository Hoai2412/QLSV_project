const db = require("../config/db");

// =============================
// GET TẤT CẢ LỊCH THI
// =============================
exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM lichthi ORDER BY NgayThi ASC"
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};

// =============================
// LOAD KHOA
// =============================
exports.getKhoa = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT TenKhoa FROM khoa WHERE TrangThai = 'Active'"
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};

// =============================
// LOAD GIÁM THỊ
// =============================
exports.getGiamThi = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT MaGV, HoTen FROM giangvien WHERE TrangThai = 'Active'"
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};

// =============================
// THÊM LỊCH THI
// =============================
exports.add = async (req, res) => {
    const { HocKy, MonThi, NgayThi, PhongThi, CaThi, GiamThi } = req.body;

    try {
        await db.query(
            `INSERT INTO lichthi (HocKy, MonThi, NgayThi, PhongThi, CaThi, GiamThi)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [HocKy, MonThi, NgayThi, PhongThi, CaThi, GiamThi]
        );

        res.json({ message: "Thêm lịch thi thành công!" });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};

// =============================
// SỬA LỊCH THI
// =============================
exports.update = async (req, res) => {
    const { id } = req.params;
    const { HocKy, MonThi, NgayThi, PhongThi, CaThi, GiamThi } = req.body;

    try {
        await db.query(
            `UPDATE lichthi
             SET HocKy=?, MonThi=?, NgayThi=?, PhongThi=?, CaThi=?, GiamThi=?
             WHERE ID=?`,
            [HocKy, MonThi, NgayThi, PhongThi, CaThi, GiamThi, id]
        );

        res.json({ message: "Cập nhật thành công!" });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};

// =============================
// XÓA LỊCH THI
// =============================
exports.delete = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query(
            "DELETE FROM lichthi WHERE ID=?",
            [id]
        );
        res.json({ message: "Xóa thành công!" });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};
