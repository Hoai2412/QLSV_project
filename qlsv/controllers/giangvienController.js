// controllers/giangvienController.js
const db = require("../config/db");

// ===============================
// 1. Lấy thông tin giảng viên
// ===============================
exports.getInfo = async (req, res) => {
    try {
        if (!req.session.giangvien) {
            return res.json({ success: false, message: "Chưa đăng nhập" });
        }

        const MaGV = req.session.giangvien.MaGV;

        const [rows] = await db.execute(
            `SELECT MaGV, HoTen, Email, SoDT, HocVi, BoMon 
             FROM giangvien 
             WHERE MaGV = ?`,
            [MaGV]
        );

        return res.json({ success: true, data: rows[0] });

    } catch (err) {
        console.error("Lỗi getInfo:", err);
        res.json({ success: false });
    }
};


// ===============================
// 2. Lớp học phần giảng viên dạy
// ===============================
exports.getLopHocPhan = async (req, res) => {
    try {
        if (!req.session.giangvien) {
            return res.json({ success: false, message: "Chưa đăng nhập" });
        }

        const MaGV = req.session.giangvien.MaGV;

        const [rows] = await db.execute(
            `SELECT lhp.MaLHP, mh.TenMH, mh.SoTC, lhp.MaHK,
                    gv.HoTen AS GiangVien,
                    lhp.SiSoHienTai, lhp.SiSoToiDa, lhp.TrangThai
             FROM lophocphan lhp
             JOIN monhoc mh ON lhp.MaMH = mh.MaMH
             JOIN giangvien gv ON lhp.MaGV = gv.MaGV
             WHERE lhp.MaGV = ?`,
            [MaGV]
        );

        return res.json({ success: true, data: rows });

    } catch (err) {
        console.error("Lỗi getLopHocPhan:", err);
        res.json({ success: false, message: "Lỗi server" });
    }
};


// ===============================
// 3. Lịch giảng dạy
// ===============================
exports.getLichDay = async (req, res) => {
    try {
        const MaGV = req.session.giangvien.MaGV;

        const [rows] = await db.execute(
            `SELECT lh.Thu, lh.TietBatDau, lh.TietKetThuc, lh.MaPhong,
                    lhp.MaLHP, mh.TenMH
             FROM lichhoc lh
             JOIN lophocphan lhp ON lh.MaLHP = lhp.MaLHP
             JOIN monhoc mh ON lhp.MaMH = mh.MaMH
             WHERE lhp.MaGV = ?
             ORDER BY lh.Thu, lh.TietBatDau`,
            [MaGV]
        );

        return res.json({ success: true, data: rows });

    } catch (err) {
        console.error("Lỗi getLichDay:", err);
        res.json({ success: false });
    }
};


// ===============================
// 4. DS sinh viên lớp học phần
// ===============================
exports.getSinhVienTrongLop = async (req, res) => {
    try {
        const { MaLHP } = req.params;

        const [rows] = await db.execute(
            `SELECT sv.MaSV, sv.HoTen, sv.Lop, sv.MaNganh, dk.TrangThai
             FROM dangkyhocphan dk
             JOIN sinhvien sv ON dk.MaSV = sv.MaSV
             WHERE dk.MaLHP = ?`,
            [MaLHP]
        );

        return res.json({ success: true, data: rows });

    } catch (err) {
        console.error("Lỗi getSVTrongLop:", err);
        res.json({ success: false });
    }
};


// ===============================
// 5. Nhật ký chỉnh sửa điểm
// ===============================
exports.getNhatKyDiem = async (req, res) => {
    try {
        const { BangDiemID } = req.params;

        const [rows] = await db.execute(
            `SELECT *
             FROM nhatkydiem
             WHERE BangDiemID = ?
             ORDER BY ThoiGian DESC`,
            [BangDiemID]
        );

        return res.json({ success: true, data: rows });

    } catch (err) {
        console.error("Lỗi getNhatKyDiem:", err);
        res.json({ success: false });
    }
};
