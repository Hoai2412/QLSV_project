const db = require("../config/db");
// controllers/studentController.js
// ==============================================
// 1. Thông tin sinh viên
// ==============================================
exports.getStudentInfo = async (req, res) => {
    try {
        const maSV = req.session.user?.MaSV;
        if (!maSV) return res.json({ success: false, message: "Chưa đăng nhập" });

        const [rows] = await db.execute(
            "SELECT MaSV, HoTen, Lop, MaNganh FROM sinhvien WHERE MaSV = ?",
            [maSV]
        );

        if (rows.length === 0) {
            return res.json({ success: false, message: "Không tìm thấy sinh viên" });
        }

        return res.json({ success: true, data: rows[0] });
    } catch (err) {
        console.error("Lỗi API getStudentInfo:", err);
        res.json({ success: false, message: "Lỗi server" });
    }
};

// ==============================================
// 2. Lịch học (gom lịch vào 1 ô LichHoc)
// ==============================================
exports.getSchedule = async (req, res) => {
    try {
        const maSV = req.session.user?.MaSV;
        if (!maSV) return res.json({ success: false, message: "Chưa đăng nhập" });

        const [rows] = await db.execute(
            `SELECT 
                l.MaLHP,
                mh.TenMH,
                GROUP_CONCAT(
                    CONCAT('Thứ ', lh.Thu,
                           ', Tiết ', lh.TietBatDau, '-', lh.TietKetThuc,
                           ', Phòng ', lh.MaPhong)
                    SEPARATOR '<br>'
                ) AS LichHoc
            FROM dangkyhocphan dk
            JOIN lophocphan l ON dk.MaLHP = l.MaLHP
            JOIN monhoc mh ON l.MaMH = mh.MaMH
            JOIN lichhoc lh ON lh.MaLHP = l.MaLHP
            WHERE dk.MaSV = ? AND dk.TrangThai = 'DaDangKy'
            GROUP BY l.MaLHP, mh.TenMH`,
            [maSV]
        );

        return res.json({ success: true, data: rows });
    } catch (err) {
        console.error("Lỗi API getSchedule:", err);
        res.json({ success: false, message: "Lỗi server" });
    }
};

// ==============================================
// 3. Kết quả học tập
// ==============================================
exports.getGrades = async (req, res) => {
    try {
        const maSV = req.session.user?.MaSV;
        if (!maSV) return res.json({ success: false, message: "Chưa đăng nhập" });

        const [rows] = await db.execute(
            `SELECT 
                l.MaLHP, mh.TenMH, mh.SoTC,
                b.DiemQT, b.DiemCK, b.DiemTK10, b.DiemChu, b.KetQua
            FROM dangkyhocphan dk
            JOIN lophocphan l ON dk.MaLHP = l.MaLHP
            JOIN monhoc mh ON l.MaMH = mh.MaMH
            JOIN bangdiem b ON b.DangKyID = dk.ID
            WHERE dk.MaSV = ?`,
            [maSV]
        );

        return res.json({ success: true, data: rows });

    } catch (err) {
        console.error("Lỗi API getGrades:", err);
        res.json({ success: false, message: "Lỗi server" });
    }
};

// ==============================================
// 4. Lớp học phần đang mở (gom lịch thành LichHoc)
// ==============================================
exports.getOpenedCourses = async (req, res) => {
    try {
        const maSV = req.session.user?.MaSV;
        if (!maSV)
            return res.json({ success: false, message: "Chưa đăng nhập" });

        // Lấy ngành của sinh viên
        const [[sv]] = await db.execute(
            "SELECT MaNganh FROM sinhvien WHERE MaSV = ?",
            [maSV]
        );
        if (!sv) return res.json({ success: false, message: "Không tìm thấy sinh viên" });

        const maNganh = sv.MaNganh;

        const [rows] = await db.execute(
            `SELECT
                l.MaLHP,
                mh.TenMH,
                mh.SoTC,
                gv.HoTen AS GiangVien,
                l.SiSoToiDa,
                l.SiSoHienTai,
                GROUP_CONCAT(
                    CONCAT('Thứ ', lh.Thu,
                           ', Tiết ', lh.TietBatDau, '-', lh.TietKetThuc,
                           ', Phòng ', lh.MaPhong)
                    SEPARATOR '<br>'
                ) AS LichHoc
            FROM lophocphan l
            JOIN monhoc mh        ON l.MaMH = mh.MaMH
            JOIN monhoc_nganh mn  ON mn.MaMH = mh.MaMH
            JOIN giangvien gv     ON l.MaGV = gv.MaGV
            LEFT JOIN lichhoc lh  ON lh.MaLHP = l.MaLHP
            WHERE l.TrangThai = 'DangMo'
              AND mn.MaNganh = ?
            GROUP BY l.MaLHP, mh.TenMH, gv.HoTen, l.SiSoToiDa, l.SiSoHienTai`,
            [maNganh]
        );

        res.json({ success: true, data: rows });

    } catch (err) {
        console.error("Lỗi getOpenedCourses:", err);
        res.json({ success: false, message: "Lỗi server" });
    }
};

// ==============================================
// 5. Lớp sinh viên đã đăng ký
// ==============================================
exports.getRegisteredCourses = async (req, res) => {
    try {
        const maSV = req.session.user?.MaSV;
        if (!maSV) return res.json({ success: false, message: "Chưa đăng nhập" });

        const [rows] = await db.execute(
            `SELECT 
                l.MaLHP, mh.TenMH, mh.SoTC
            FROM dangkyhocphan dk
            JOIN lophocphan l ON dk.MaLHP = l.MaLHP
            JOIN monhoc mh ON l.MaMH = mh.MaMH
            WHERE dk.MaSV = ? AND dk.TrangThai = 'DaDangKy'`,
            [maSV]
        );

        return res.json({ success: true, data: rows });

    } catch (err) {
        console.error("Lỗi API getRegisteredCourses:", err);
        res.json({ success: false, message: "Lỗi server" });
    }
};

// ==============================================
// 6. Lưu đăng ký học phần (KHÔNG dùng procedure)
// ==============================================
exports.saveRegistration = async (req, res) => {
    try {
        const maSV = req.session.user?.MaSV;
        const { MaLHP } = req.body;

        if (!maSV) return res.json({ success: false, message: "Chưa đăng nhập" });

        // Lấy 1 học kỳ mặc định (lấy theo thứ tự)
        const [[hk]] = await db.execute(
            "SELECT MaHK FROM hocky ORDER BY ThuTu LIMIT 1"
        );
        if (!hk) return res.json({ success: false, message: "Chưa có dữ liệu học kỳ" });

        // Kiểm tra đã đăng ký chưa
        const [[exist]] = await db.execute(
            `SELECT ID FROM dangkyhocphan 
             WHERE MaSV = ? AND MaLHP = ? AND MaHK = ? AND TrangThai = 'DaDangKy'`,
            [maSV, MaLHP, hk.MaHK]
        );
        if (exist) {
            return res.json({ success: false, message: "Lớp này đã đăng ký rồi" });
        }

        // Thêm mới
        await db.execute(
            `INSERT INTO dangkyhocphan (MaSV, MaLHP, MaHK, TrangThai)
             VALUES (?, ?, ?, 'DaDangKy')`,
            [maSV, MaLHP, hk.MaHK]
        );

        return res.json({ success: true, message: "Đăng ký thành công" });

    } catch (err) {
        console.error("Lỗi API saveRegistration:", err);
        return res.json({ success: false, message: err.sqlMessage || "Lỗi đăng ký" });
    }
};

// ==============================================
// 7. Hủy đăng ký (KHÔNG dùng procedure)
// ==============================================
exports.cancelRegistration = async (req, res) => {
    try {
        const maSV = req.session.user?.MaSV;
        const { MaLHP } = req.body;

        if (!maSV) return res.json({ success: false, message: "Chưa đăng nhập" });

        await db.execute(
            `UPDATE dangkyhocphan 
             SET TrangThai = 'DaHuy'
             WHERE MaSV = ? AND MaLHP = ? AND TrangThai = 'DaDangKy'`,
            [maSV, MaLHP]
        );

        return res.json({ success: true, message: "Đã hủy đăng ký" });

    } catch (err) {
        console.error("Lỗi API cancelRegistration:", err);
        return res.json({ success: false, message: err.sqlMessage || "Lỗi hủy đăng ký" });
    }
};

// ==============================================
// 8. Chương trình đào tạo
// ==============================================
exports.getCurriculum = async (req, res) => {
    try {
        const maSV = req.session.user?.MaSV;
        if (!maSV) return res.json({ success: false, message: "Chưa đăng nhập" });

        const [[sv]] = await db.execute(
            "SELECT MaNganh FROM sinhvien WHERE MaSV = ?",
            [maSV]
        );
        if (!sv) return res.json({ success: false, message: "Không tìm thấy sinh viên" });

        const [rows] = await db.execute(
            `SELECT 
                mn.NamKienNghi AS Nam,
                mn.HKienNghi AS HK,
                mh.MaMH,
                mh.TenMH,
                mh.SoTC,
                mh.LoaiMon
            FROM monhoc_nganh mn
            JOIN monhoc mh ON mn.MaMH = mh.MaMH
            WHERE mn.MaNganh = ?
            ORDER BY mn.NamKienNghi, mn.HKienNghi`,
            [sv.MaNganh]
        );

        res.json({ success: true, data: rows });

    } catch (err) {
        console.error("Lỗi API getCurriculum:", err);
        res.json({ success: false, message: "Lỗi server" });
    }
};
