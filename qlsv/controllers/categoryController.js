// controllers/categoryController.js
const db = require('../config/db');

// ==================================================
// 1. QUẢN LÝ KHOA
// ==================================================

exports.getKhoa = async (req, res) => {
    try {
        const { search } = req.query;
        let sql = "SELECT * FROM khoa";
        let params = [];

        if (search) {
            sql += " WHERE MaKhoa LIKE ? OR TenKhoa LIKE ?";
            params.push(`%${search}%`, `%${search}%`);
        }
        
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createKhoa = async (req, res) => {
    try {
        const { MaKhoa, TenKhoa } = req.body;
        await db.query("INSERT INTO khoa (MaKhoa, TenKhoa) VALUES (?, ?)", [MaKhoa, TenKhoa]);
        res.json({ message: "Thêm khoa thành công!" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi thêm khoa: " + err.message });
    }
};

exports.updateKhoa = async (req, res) => {
    try {
        const { id } = req.params; // id là MaKhoa cũ
        const { MaKhoa, TenKhoa } = req.body; // MaKhoa mới (nếu cho sửa) và TenKhoa
        // Nếu không cho sửa mã khoa thì chỉ update TenKhoa
        await db.query("UPDATE khoa SET TenKhoa = ? WHERE MaKhoa = ?", [TenKhoa, id]);
        res.json({ message: "Cập nhật thành công!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteKhoa = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM khoa WHERE MaKhoa = ?", [id]);
        res.json({ message: "Đã xóa khoa!" });
    } catch (err) {
        // Bắt lỗi ràng buộc khóa ngoại (nếu khoa đã có ngành)
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            res.status(400).json({ message: "Không thể xóa: Khoa này đang chứa các ngành học." });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
};

// ==================================================
// 2. QUẢN LÝ NGÀNH
// ==================================================

exports.getNganh = async (req, res) => {
    try {
        const { search, maKhoa } = req.query;
        let sql = `
            SELECT n.*, k.TenKhoa 
            FROM nganh n 
            JOIN khoa k ON n.MaKhoa = k.MaKhoa
            WHERE 1=1
        `;
        let params = [];

        if (maKhoa) {
            sql += " AND n.MaKhoa = ?";
            params.push(maKhoa);
        }
        if (search) {
            sql += " AND (n.MaNganh LIKE ? OR n.TenNganh LIKE ?)";
            params.push(`%${search}%`, `%${search}%`);
        }

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createNganh = async (req, res) => {
    try {
        const { MaNganh, TenNganh, MaKhoa } = req.body;
        await db.query("INSERT INTO nganh (MaNganh, TenNganh, MaKhoa) VALUES (?, ?, ?)", 
            [MaNganh, TenNganh, MaKhoa]);
        res.json({ message: "Thêm ngành thành công!" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi: " + err.message });
    }
};

exports.updateNganh = async (req, res) => {
    try {
        const { id } = req.params;
        const { TenNganh, MaKhoa } = req.body;
        await db.query("UPDATE nganh SET TenNganh=?, MaKhoa=? WHERE MaNganh=?", 
            [TenNganh, MaKhoa, id]);
        res.json({ message: "Cập nhật ngành thành công!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteNganh = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM nganh WHERE MaNganh = ?", [id]);
        res.json({ message: "Đã xóa ngành!" });
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            res.status(400).json({ message: "Không thể xóa: Ngành này đang có môn học hoặc sinh viên." });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
};

// ==================================================
// 3. QUẢN LÝ MÔN HỌC
// ==================================================

exports.getMon = async (req, res) => {
    try {
        const { search, maNganh, maKhoa } = req.query;
        // Join 3 bảng để lấy tên Ngành và tên Khoa
        let sql = `
            SELECT m.*, n.TenNganh, k.TenKhoa, k.MaKhoa
            FROM monhoc m
            JOIN nganh n ON m.MaNganh = n.MaNganh
            JOIN khoa k ON n.MaKhoa = k.MaKhoa
            WHERE 1=1
        `;
        let params = [];

        // Filter theo Khoa (nếu có chọn khoa nhưng chưa chọn ngành)
        if (maKhoa && !maNganh) {
            sql += " AND k.MaKhoa = ?";
            params.push(maKhoa);
        }
        // Filter theo Ngành
        if (maNganh) {
            sql += " AND m.MaNganh = ?";
            params.push(maNganh);
        }
        // Tìm kiếm
        if (search) {
            sql += " AND (m.MaMH LIKE ? OR m.TenMH LIKE ?)";
            params.push(`%${search}%`, `%${search}%`);
        }

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createMon = async (req, res) => {
    try {
        // Lưu ý: bảng monhoc cần có cột MaNganh
        const { MaMH, TenMH, SoTC, MaNganh } = req.body;
        await db.query(
            "INSERT INTO monhoc (MaMH, TenMH, SoTC, MaNganh) VALUES (?, ?, ?, ?)", 
            [MaMH, TenMH, SoTC, MaNganh]
        );
        res.json({ message: "Thêm môn học thành công!" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi: " + err.message });
    }
};

exports.updateMon = async (req, res) => {
    try {
        const { id } = req.params;
        const { TenMH, SoTC, MaNganh } = req.body;
        await db.query(
            "UPDATE monhoc SET TenMH=?, SoTC=?, MaNganh=? WHERE MaMH=?", 
            [TenMH, SoTC, MaNganh, id]
        );
        res.json({ message: "Cập nhật môn thành công!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteMon = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM monhoc WHERE MaMH = ?", [id]);
        res.json({ message: "Đã xóa môn học!" });
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
             res.status(400).json({ message: "Không thể xóa: Môn học này đã có lớp học phần." });
        } else {
             res.status(500).json({ message: err.message });
        }
    }
};