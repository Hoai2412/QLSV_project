// controllers/studentController.js
const db = require("../config/db");

// ==============================================
// 1. Thông tin sinh viên
// ==============================================
exports.getStudentInfo = async (req, res) => {
  try {
    const maSV = req.session.user?.MaSV;
    if (!maSV) {
      return res.json({ success: false, message: "Chưa đăng nhập" });
    }

    const [rows] = await db.execute(
      `SELECT 
          MaSV,
          HoTen,
          NgaySinh,
          Email,
          SoDT,
          DiaChi,
          Lop,
          MaNganh,
          TrangThai
       FROM sinhvien
       WHERE MaSV = ?`,
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
// // 3. KẾT QUẢ HỌC TẬP (THEO NĂM HỌC - HỌC KỲ)
// // ==============================================
// exports.getGrades = async (req, res) => {
//     try {
//         const maSV = req.session.user?.MaSV;
//         if (!maSV) {
//             return res.json({ success: false, message: "Chưa đăng nhập" });
//         }

//         const [rows] = await db.execute(
//             `
//             SELECT 
//                 -- Năm học & học kỳ (dùng để gom nhóm)
//                 nh.MaNamHoc,
//                 nh.MoTa        AS NamHoc,
//                 hk.TenHK       AS HocKy,
//                 hk.ThuTu       AS ThuTuHK,

//                 -- Lớp & môn học
//                 lhp.MaLHP,
//                 mh.MaMH,
//                 mh.TenMH,
//                 mh.SoTC,

//                 -- Điểm
//                 bd.DiemQT,
//                 bd.DiemCK,
//                 bd.DiemTK10,
//                 bd.DiemChu,
//                 bd.KetQua
//             FROM sinhvien sv
//             JOIN dangkyhocphan dk 
//                 ON sv.MaSV = dk.MaSV
//             JOIN lophocphan lhp 
//                 ON dk.MaLHP = lhp.MaLHP
//             JOIN monhoc mh 
//                 ON lhp.MaMH = mh.MaMH
//             JOIN hocky hk 
//                 ON dk.MaHK = hk.MaHK
//             JOIN namhoc nh 
//                 ON hk.MaNamHoc = nh.MaNamHoc
//             LEFT JOIN bangdiem bd 
//                 ON dk.ID = bd.DangKyID
//             WHERE sv.MaSV = ?
//               AND dk.TrangThai = 'DaDangKy'
//               -- 🔒 CHẶN DỮ LIỆU LỖI (QUAN TRỌNG)
//               AND nh.MoTa IS NOT NULL
//               AND hk.TenHK IS NOT NULL
//             ORDER BY 
//                 nh.MaNamHoc DESC,   -- năm mới trước
//                 hk.ThuTu ASC,       -- HK 1 → 2
//                 mh.TenMH ASC
//             `,
//             [maSV]
//         );

//         return res.json({
//             success: true,
//             data: rows
//         });

//     } catch (err) {
//         console.error("Lỗi getGrades:", err);
//         return res.json({
//             success: false,
//             message: "Lỗi server"
//         });
//     }
// };
// ===== 3. KẾT QUẢ HỌC TẬP (THEO monhoc_nganh) =====
exports.getGrades = async (req, res) => {
    try {
        const maSV = req.session.user?.MaSV;
        if (!maSV) {
            return res.json({ success: false, message: "Chưa đăng nhập" });
        }

        const [rows] = await db.execute(
            `
            SELECT 
                mhn.NamKienNghi   AS Nam,
                mhn.HKienNghi    AS HK,

                mh.MaMH,
                mh.TenMH,
                mh.SoTC,

                bd.DiemQT,
                bd.DiemCK,
                bd.DiemTK10,
                bd.DiemChu,

                CASE 
                    WHEN bd.DiemTK10 IS NOT NULL THEN 'DaHoc'
                    ELSE 'ChuaHoc'
                END AS TrangThai
            FROM sinhvien sv
            JOIN monhoc_nganh mhn 
                ON sv.MaNganh = mhn.MaNganh
            JOIN monhoc mh 
                ON mhn.MaMH = mh.MaMH
            LEFT JOIN lophocphan lhp 
                ON lhp.MaMH = mh.MaMH
            LEFT JOIN dangkyhocphan dk 
                ON dk.MaLHP = lhp.MaLHP
               AND dk.MaSV = sv.MaSV
               AND dk.TrangThai = 'DaDangKy'
            LEFT JOIN bangdiem bd 
                ON bd.DangKyID = dk.ID
            WHERE sv.MaSV = ?
            ORDER BY mhn.NamKienNghi, mhn.HKienNghi, mh.MaMH
            `,
            [maSV]
        );

        res.json({ success: true, data: rows });

    } catch (err) {
        console.error("Lỗi getGrades:", err);
        res.json({ success: false, message: "Lỗi server" });
    }
};


// ==============================================
// 4. Lớp học phần đang mở (gom lịch thành LichHoc)
// ==============================================
exports.getOpenedCourses = async (req, res) => {
    try {
        const maSV = req.session.user?.MaSV;

        // Thêm kiểm tra này để tránh lỗi bind undefined
        if (!maSV) return res.json({ success: false, message: "Chưa đăng nhập" });

        const [[sv]] = await db.execute(
            "SELECT MaNganh FROM SinhVien WHERE MaSV = ?",
            [maSV]
        );

        //--- SỬA LỖI Ở ĐÂY: Kiểm tra sv có tồn tại không ---
        if (!sv || !sv.MaNganh) {
            console.log("Lỗi: Không tìm thấy Mã ngành của sinh viên " + maSV);
            return res.json({ success: false, data: [] }); // Trả về rỗng thay vì để server crash
        }

        const [rows] = await db.execute(
            `SELECT
                l.MaLHP,
                mh.TenMH,
                mh.SoTC,
                gv.HoTen AS GiangVien,
                l.SiSoToiDa,
                l.SiSoHienTai,
                GROUP_CONCAT(
                    CONCAT('Thứ ', lh.Thu, ' (', lh.TietBatDau, '-', lh.TietKetThuc, ') - ', lh.MaPhong)
                    SEPARATOR '<br>'
                ) AS LichHoc
            FROM LopHocPhan l
            JOIN MonHoc mh ON l.MaMH = mh.MaMH
            JOIN MonHoc_Nganh mn ON mn.MaMH = mh.MaMH
            JOIN GiangVien gv ON gv.MaGV = l.MaGV
            LEFT JOIN LichHoc lh ON lh.MaLHP = l.MaLHP
            WHERE mn.MaNganh = ? AND l.TrangThai='DangMo'
            -- Chỉ hiện lớp thuộc MaHK đang có đợt đăng ký mở active --
              AND l.MaHK IN (
                  SELECT MaHK 
                  FROM dotdangky 
                  WHERE TrangThai = 'Active' 
                  AND NOW() >= NgayBatDau 
                  AND NOW() <= NgayKetThuc
              )
            GROUP BY l.MaLHP`,
            [sv.MaNganh]
        );

        res.json({ success: true, data: rows });

    } catch (err) {
        console.error("Lỗi getOpenedCourses:", err);
        res.json({ success: false });
    }
};


// ==============================================
// 5. Lớp sinh viên đã đăng ký
// ==============================================
exports.getRegisteredCourses = async (req, res) => {
    try {
        const maSV = req.session.user?.MaSV;
        if (!maSV) return res.json({ success: false });

        const [rows] = await db.execute(
            `SELECT 
                l.MaLHP, mh.TenMH, mh.SoTC,
                dk.TrangThai
            FROM DangKyHocPhan dk
            JOIN LopHocPhan l ON dk.MaLHP = l.MaLHP
            JOIN MonHoc mh ON l.MaMH = mh.MaMH
            WHERE dk.MaSV = ? AND dk.TrangThai='DaDangKy'`,
            [maSV]
        );

        res.json({ success: true, data: rows });

    } catch (err) {
        console.error(err);
        res.json({ success: false });
    }
};

// =====================================================
// 6. API: LƯU ĐĂNG KÝ HỌC PHẦN (CÓ CHECK ĐỢT ĐĂNG KÝ)
// =====================================================
exports.saveRegistration = async (req, res) => {
    try {
        const maSV = req.session.user?.MaSV;
        const { MaLHP } = req.body;

        if (!maSV) return res.json({ success: false, message: "Chưa đăng nhập" });

        // BƯỚC 1: Lấy MaHK của Lớp học phần mà sinh viên chọn
        const [[lhp]] = await db.execute(
            "SELECT MaHK FROM LopHocPhan WHERE MaLHP = ?",
            [MaLHP]
        );

        if (!lhp) {
            return res.json({ success: false, message: `Lớp ${MaLHP} không tồn tại` });
        }

        const MaHK = lhp.MaHK;

        // ==================================================================
        // BƯỚC 2: KIỂM TRA ĐỢT ĐĂNG KÝ
        // Logic: Tìm trong bảng dotdangky xem có dòng nào thỏa mãn:
        // 1. Cùng Học kỳ (MaHK)
        // 2. Trạng thái là 'Active'
        // 3. Thời gian hiện tại (NOW()) nằm giữa NgayBatDau và NgayKetThuc
        // ==================================================================
        const [validPeriod] = await db.execute(
            `SELECT * FROM dotdangky 
             WHERE MaHK = ? 
             AND TrangThai = 'Active' 
             AND NOW() >= NgayBatDau 
             AND NOW() <= NgayKetThuc
             LIMIT 1`,
            [MaHK]
        );

        // Nếu không tìm thấy đợt nào thỏa mãn -> Chặn luôn
        if (validPeriod.length > 0) 
            console.log("Debug: Tìm thấy đợt mở ->", validPeriod[0].TenDot);
        else{
            console.log(`Debug: KHÔNG tìm thấy đợt mở nào cho học kỳ ${MaHK}. (Kiểm tra lại bảng dotdangky)`);
            return res.json({ 
                success: false, 
                message: `Học phần thuộc học kỳ ${MaHK} hiện chưa mở đăng ký hoặc đã hết hạn!` 
            });
        }
        
        // (Tùy chọn) Kiểm tra hạn mức tín chỉ lấy từ validPeriod[0].HanMucTinChi ở đây nếu cần

        // ==================================================================
        // BƯỚC 3: NẾU HỢP LỆ THÌ TIẾN HÀNH ĐĂNG KÝ
        // ==================================================================
        
        // Kiểm tra xem đã đăng ký lớp này chưa để tránh báo lỗi trùng khóa chính (nếu cần kỹ hơn)
        // Tuy nhiên câu lệnh INSERT ... ON DUPLICATE KEY UPDATE bên dưới đã xử lý việc này.
        
        await db.execute(
            `INSERT INTO DangKyHocPhan(MaSV, MaLHP, MaHK, TrangThai)
             VALUES (?, ?, ?, 'DaDangKy')
             ON DUPLICATE KEY UPDATE TrangThai='DaDangKy'`,
            [maSV, MaLHP, MaHK]
        );

        // Cập nhật sĩ số hiện tại của lớp học phần (Tăng lên 1)
        // Lưu ý: Chỉ nên tăng nếu trước đó chưa đăng ký, nhưng để đơn giản ta có thể chạy update
        await db.execute(
            "UPDATE LopHocPhan SET SiSoHienTai = SiSoHienTai + 1 WHERE MaLHP = ?",
            [MaLHP]
        );

        return res.json({ success: true, message: "Đăng ký thành công!" });

    } catch (err) {
        console.error("Lỗi API saveRegistration:", err);
        res.json({ success: false, message: "Lỗi hệ thống khi đăng ký" });
    }
};


// =====================================================
// 7. API: HỦY ĐĂNG KÝ (CÓ CHECK ĐỢT ĐĂNG KÝ)
// =====================================================
exports.cancelRegistration = async (req, res) => {
    try {    
        const maSV = req.session.user?.MaSV;
        const { MaLHP } = req.body;

        if (!maSV) return res.json({ success: false, message: "Chưa đăng nhập" });

        // BƯỚC 1: Lấy MaHK của lớp học phần cần hủy
        const [[lhp]] = await db.execute(
            "SELECT MaHK FROM LopHocPhan WHERE MaLHP = ?",
            [MaLHP]
        );

        if (!lhp) {
            return res.json({ success: false, message: "Lớp học phần không tồn tại" });
        }
        const MaHK = lhp.MaHK;

        // BƯỚC 2: KIỂM TRA ĐỢT ĐĂNG KÝ (Logic giống hệt hàm đăng ký)
        // Phải có đợt đang Active VÀ còn trong thời gian cho phép
        const [validPeriod] = await db.execute(
            `SELECT * FROM dotdangky 
             WHERE MaHK = ? 
             AND TrangThai = 'Active' 
             AND NOW() >= NgayBatDau 
             AND NOW() <= NgayKetThuc
             LIMIT 1`,
            [MaHK]
        );

        if (validPeriod.length === 0) {
            return res.json({ 
                success: false, 
                message: "Không thể hủy! Đợt đăng ký/hủy học phần đã kết thúc hoặc chưa mở." 
            });
        }

        // BƯỚC 3: THỰC HIỆN HỦY
        
        // 3.1 Cập nhật trạng thái sang 'DaHuy'
        // Cần kiểm tra xem sinh viên có thực sự đang đăng ký môn này không trước khi trừ sĩ số
        const [updateResult] = await db.execute(
            `UPDATE DangKyHocPhan
             SET TrangThai='DaHuy'
             WHERE MaSV=? AND MaLHP=? AND TrangThai='DaDangKy'`,
            [maSV, MaLHP]
        );

        // Nếu updateResult.affectedRows > 0 nghĩa là có hủy thành công
        if (updateResult.affectedRows > 0) {
            // 3.2 Giảm sĩ số hiện tại của lớp đi 1 (Quan trọng để cập nhật lại chỗ trống)
            await db.execute(
                "UPDATE LopHocPhan SET SiSoHienTai = SiSoHienTai - 1 WHERE MaLHP = ? AND SiSoHienTai > 0",
                [MaLHP]
            );
            
            return res.json({ success: true, message: "Đã hủy học phần thành công!" });
        } else {
            return res.json({ success: false, message: "Bạn chưa đăng ký môn này hoặc đã hủy rồi." });
        }

    } catch (err) {
        console.error("Lỗi API cancelRegistration:", err);
        res.json({ success: false, message: "Không thể hủy học phần do lỗi hệ thống" });
    }
};

// 
// 8. Chương trình đào tạo (ĐÚNG THEO DB chuongtrinhdaotao)
// exports.getCurriculum = async (req, res) => {
//   try {
//     const maSV = req.session.user?.MaSV;
//     if (!maSV) return res.json({ success: false, message: "Chưa đăng nhập" });

//     const [[sv]] = await db.execute(
//       "SELECT MaNganh FROM sinhvien WHERE MaSV = ?",
//       [maSV]
//     );
//     if (!sv) return res.json({ success: false, message: "Không tìm thấy sinh viên" });

//     const [rows] = await db.execute(
//       `
//       SELECT
//         ctdt.NamKienNghi AS Nam,
//         ctdt.HKienNghi  AS HK,
//         mh.MaMH,
//         mh.TenMH,
//         mh.SoTC,
//         ctdt.LoaiMon,
//         ctdt.GhiChu
//       FROM chuongtrinhdaotao ctdt
//       JOIN monhoc mh ON mh.MaMH = ctdt.MaMH
//       WHERE ctdt.MaNganh = ?
//       ORDER BY ctdt.NamKienNghi, ctdt.HKienNghi, mh.MaMH
//       `,
//       [sv.MaNganh]
//     );

//     res.json({ success: true, data: rows });
//   } catch (err) {
//     console.error("Lỗi API getCurriculum:", err);
//     res.json({ success: false, message: "Lỗi server" });
//   }
// };

// ===== 8. CHƯƠNG TRÌNH ĐÀO TẠO (THEO monhoc_nganh) =====
exports.getCurriculum = async (req, res) => {
    try {
        const maSV = req.session.user?.MaSV;
        if (!maSV) {
            return res.json({ success: false, message: "Chưa đăng nhập" });
        }

        const [rows] = await db.execute(
            `
            SELECT 
                mhn.NamKienNghi AS Nam,
                mhn.HKienNghi AS HK,
                mh.MaMH,
                mh.TenMH,
                mh.SoTC,
                mh.LoaiMon
            FROM sinhvien sv
            JOIN monhoc_nganh mhn ON sv.MaNganh = mhn.MaNganh
            JOIN monhoc mh ON mhn.MaMH = mh.MaMH
            WHERE sv.MaSV = ?
            ORDER BY mhn.NamKienNghi, mhn.HKienNghi, mh.MaMH
            `,
            [maSV]
        );

        res.json({ success: true, data: rows });
    } catch (err) {
        console.error("Lỗi API getCurriculum:", err);
        res.json({ success: false, message: "Lỗi server" });
    }
};


// ==============================================
// 9. LỊCH THI SINH VIÊN new
// ==============================================
exports.getExamSchedule = async (req, res) => {
    try {
        const maSV = req.session.user?.MaSV;
        if (!maSV) {
            return res.json({ success: false, message: "Chưa đăng nhập" });
        }

        const [rows] = await db.execute(
            `
            SELECT DISTINCT
                lt.ID,
                lt.HocKy,
                mh.TenMH AS MonThi,
                lt.NgayThi,
                lt.CaThi,
                lt.PhongThi,
                gv.HoTen AS GiamThi
            FROM dangkyhocphan dk
            JOIN lophocphan lhp ON dk.MaLHP = lhp.MaLHP
            JOIN monhoc mh ON lhp.MaMH = mh.MaMH
            JOIN lichthi lt 
                ON lt.MonThi = mh.TenMH 
               AND lt.HocKy = lhp.MaHK
            LEFT JOIN giangvien gv ON gv.MaGV = lt.GiamThi
            WHERE dk.MaSV = ?
              AND dk.TrangThai = 'DaDangKy'
            ORDER BY lt.NgayThi ASC
            `,
            [maSV]
        );

        res.json({ success: true, data: rows });

    } catch (err) {
        console.error("Lỗi getExamSchedule:", err);
        res.json({ success: false, message: "Lỗi server" });
    }
};

// ==============================================
// 10. TRA CỨU HỌC PHẦN (THEO MÃ / TÊN)
// ==============================================
exports.searchCourse = async (req, res) => {
    try {
        const { maMH, tenMH } = req.query;

        let sql = `
            SELECT 
                mh.MaMH,
                mh.TenMH,
                mh.SoTC,
                mh.LoaiMon,
                n.TenNganh
            FROM monhoc mh
            LEFT JOIN nganh n ON mh.MaNganh = n.MaNganh
            WHERE 1=1
        `;
        let params = [];

        if (maMH) {
            sql += " AND mh.MaMH LIKE ?";
            params.push(`%${maMH}%`);
        }

        if (tenMH) {
            sql += " AND mh.TenMH LIKE ?";
            params.push(`%${tenMH}%`);
        }

        sql += " ORDER BY mh.MaMH";

        const [rows] = await db.execute(sql, params);

        res.json({ success: true, data: rows });

    } catch (err) {
        console.error("Lỗi searchCourse:", err);
        res.json({ success: false, message: "Lỗi server" });
    }
};

exports.updateStudentProfile = async (req, res) => {
  try {
    const maSV = req.session.user?.MaSV;
    if (!maSV) return res.json({ success: false });

    const { NgaySinh, Email, SoDT, DiaChi } = req.body;

    await db.execute(
      `UPDATE sinhvien
       SET NgaySinh=?, Email=?, SoDT=?, DiaChi=?
       WHERE MaSV=?`,
      [NgaySinh, Email, SoDT, DiaChi, maSV]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
};
