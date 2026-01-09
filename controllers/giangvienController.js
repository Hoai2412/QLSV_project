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

    const MaGV = req.session.giangvien.MaGV; // ✅ BẠN ĐANG THIẾU DÒNG NÀY

    const [rows] = await db.execute(
      `
      SELECT 
          lhp.MaLHP, mh.TenMH, mh.SoTC, lhp.MaHK,
          gv.HoTen AS GiangVien,
          COALESCE(ss.SiSoHienTai, 0) AS SiSoHienTai,
          lhp.SiSoToiDa, lhp.TrangThai
      FROM lophocphan lhp
      JOIN monhoc mh ON lhp.MaMH = mh.MaMH
      JOIN giangvien gv ON lhp.MaGV = gv.MaGV
      LEFT JOIN (
          SELECT dk.MaLHP, dk.MaHK, COUNT(*) AS SiSoHienTai
          FROM dangkyhocphan dk
          JOIN (
              SELECT MaLHP, MaHK, MaSV, MAX(ID) AS MaxID
              FROM dangkyhocphan
              GROUP BY MaLHP, MaHK, MaSV
          ) x ON x.MaxID = dk.ID
          WHERE dk.TrangThai = 'DaDangKy'
          GROUP BY dk.MaLHP, dk.MaHK
      ) ss ON ss.MaLHP = lhp.MaLHP AND ss.MaHK = lhp.MaHK
      WHERE lhp.MaGV = ?
      `,
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
// 7. Lịch thi (theo giảng viên/giám thị)
// ===============================
exports.getLichThi = async (req, res) => {
  try {
    if (!req.session.giangvien) {
      return res.json({ success: false, message: "Chưa đăng nhập" });
    }

    const MaGV = req.session.giangvien.MaGV;

    // LỌC THEO GIẢNG VIÊN (cột GiamThi trong bảng lichthi)
    const [rows] = await db.execute(
      `SELECT 
          ID, HocKy, MonThi, NgayThi, PhongThi, CaThi, GiamThi
       FROM lichthi
       WHERE GiamThi = ?
       ORDER BY NgayThi ASC, CaThi ASC`,
      [MaGV]
    );

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Lỗi getLichThi:", err);
    res.json({ success: false, message: "Lỗi server" });
  }
};


// ===============================
// 4. DS sinh viên lớp học phần
// ===============================
/// ===============================
exports.getSinhVienTrongLop = async (req, res) => {
  try {
    const { MaLHP } = req.params;

    // Lấy học kỳ của lớp học phần để lọc đúng học kỳ (tránh lấy đăng ký học kỳ khác)
    const [[lhp]] = await db.execute(
      `SELECT MaHK FROM lophocphan WHERE MaLHP = ?`,
      [MaLHP]
    );
    if (!lhp) return res.json({ success: true, data: [] });

    const MaHK = lhp.MaHK;

    // Mỗi MaSV chỉ lấy 1 DangKyID (bản ghi DaDangKy mới nhất)
          const [rows] = await db.execute(
        `
        SELECT 
          dk.ID AS DangKyID,
          sv.MaSV, sv.HoTen, sv.Lop, sv.MaNganh,
          dk.TrangThai,
          bd.TyLeQT, bd.TyLeCK,
          bd.DiemQT, bd.DiemCK,
          bd.DiemTK10, bd.DiemChu, bd.KetQua
        FROM dangkyhocphan dk
        JOIN (
          SELECT MaSV, MAX(ID) AS MaxDK
          FROM dangkyhocphan
          WHERE MaLHP = ? AND MaHK = ?
          GROUP BY MaSV
        ) x ON x.MaxDK = dk.ID
        JOIN sinhvien sv ON sv.MaSV = dk.MaSV
        LEFT JOIN bangdiem bd ON bd.DangKyID = dk.ID
        WHERE dk.TrangThai = 'DaDangKy'
        ORDER BY sv.MaSV
        `,
        [MaLHP, MaHK]
      );


    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Lỗi getSVTrongLop:", err);
    res.json({ success: false, message: "Lỗi server" });
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
// controllers/giangvienController.js

// ===============================
// 6. Lưu bảng điểm
// ===============================
exports.saveBangDiem = async (req, res) => {
  try {
    if (!req.session.giangvien) {
      return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
    }

    const MaGV = req.session.giangvien.MaGV;

    // ✅ LẤY MaLHP TỪ BODY (đây là chỗ bạn thiếu)
    let { MaLHP, TyLeQT, TyLeCK, ds } = req.body;

    if (!MaLHP) {
      return res.status(400).json({ success: false, message: "Thiếu MaLHP" });
    }

    // ✅ 1) Check quyền GV + trạng thái sổ điểm (admin mở/khóa)
    const [[lhp]] = await db.execute(
      `SELECT TrangThaiSoDiem
       FROM lophocphan
       WHERE MaLHP = ? AND MaGV = ?
       LIMIT 1`,
      [MaLHP, MaGV]
    );

    if (!lhp) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền với lớp học phần này"
      });
    }

    const trangThaiSo = (lhp.TrangThaiSoDiem || "Mo").trim();

    if (trangThaiSo === "Khoa") {
      return res.status(403).json({
        success: false,
        message: "Sổ điểm đã bị khóa. Không thể lưu điểm."
      });
    }


    // Chuẩn hóa tỉ lệ: FE có thể gửi 50/50 hoặc 0.5/0.5
    TyLeQT = Number(TyLeQT);
    TyLeCK = Number(TyLeCK);
    if (TyLeQT > 1) TyLeQT = TyLeQT / 100;
    if (TyLeCK > 1) TyLeCK = TyLeCK / 100;

    // Nếu FE gửi ds rỗng/null
    if (!Array.isArray(ds) || ds.length === 0) {
      return res.json({ success: true, message: "Không có dữ liệu để lưu" });
    }

    for (const row of ds) {
      const DangKyID = row.DangKyID;

      // ép số, tránh NaN
      const DiemQT = row.DiemQT === "" || row.DiemQT == null ? null : Number(row.DiemQT);
      const DiemCK = row.DiemCK === "" || row.DiemCK == null ? null : Number(row.DiemCK);

      // Nếu thiếu điểm thì cho null/0 tùy rule của bạn (mình chọn null => không tính)
      const qt = DiemQT == null ? 0 : DiemQT;
      const ck = DiemCK == null ? 0 : DiemCK;

      // Tính tổng kết (10)
      const TK10 = +(qt * TyLeQT + ck * TyLeCK).toFixed(2);

      // Quy đổi chữ + GPA + KQ
      const { diemChu, gpa } = toLetterAndGPA(TK10);
      const ketQua = gpa > 0 ? "Đạt" : "Rớt";

      // Lưu bảng điểm
      await db.execute(
        `INSERT INTO bangdiem (DangKyID, DiemQT, DiemCK, TyLeQT, TyLeCK, DiemTK10, DiemChu, KetQua)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            DiemQT   = VALUES(DiemQT),
            DiemCK   = VALUES(DiemCK),
            TyLeQT   = VALUES(TyLeQT),
            TyLeCK   = VALUES(TyLeCK),
            DiemTK10 = VALUES(DiemTK10),
            DiemChu  = VALUES(DiemChu),
            KetQua   = VALUES(KetQua)`,
        [DangKyID, DiemQT, DiemCK, TyLeQT, TyLeCK, TK10, diemChu, ketQua]
      );

      // Ghi nhật ký (đúng tên cột)
      await db.execute(
        `INSERT INTO nhatkydiem (BangDiemID, ThoiGian, NguoiSua, NoiDung)
         SELECT ID, NOW(), ?, CONCAT('Cập nhật điểm: QT=', ?, ', CK=', ?, ', TK=', ?)
         FROM bangdiem
         WHERE DangKyID = ?
         ORDER BY ID DESC
         LIMIT 1`,
        [MaGV, DiemQT, DiemCK, TK10, DangKyID]
      );
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Lỗi saveBangDiem:", err);
    return res.json({ success: false, message: "Lỗi server" });
  }
};

// Helper phải đặt NGOÀI controller (nhưng trong cùng file) và KHÔNG gọi await ở ngoài
function toLetterAndGPA(tk10) {
  if (tk10 >= 8.5) return { diemChu: "A", gpa: 4 };
  if (tk10 >= 7.0) return { diemChu: "B", gpa: 3 };
  if (tk10 >= 5.5) return { diemChu: "C", gpa: 2 };
  if (tk10 >= 4.0) return { diemChu: "D", gpa: 1 };
  return { diemChu: "F", gpa: 0 };
}
