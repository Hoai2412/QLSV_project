// controllers/diemController.js
const db = require("../config/db");

// 1) DS LHP cho Admin
exports.getLopHocPhanForAdmin = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        lhp.MaLHP,
        mh.TenMH,
        mh.SoTC,
        lhp.MaHK,
        lhp.TrangThaiSoDiem,
        lhp.SiSoToiDa,
        COALESCE(ss.SiSoHienTai, 0) AS SiSoHienTai,
        COALESCE(sd.SoDiem, 0) AS SoDiem
      FROM lophocphan lhp
      JOIN monhoc mh ON lhp.MaMH = mh.MaMH
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
      LEFT JOIN (
        SELECT dk.MaLHP, COUNT(*) AS SoDiem
        FROM bangdiem bd
        JOIN dangkyhocphan dk ON dk.ID = bd.DangKyID
        GROUP BY dk.MaLHP
      ) sd ON sd.MaLHP = lhp.MaLHP
      ORDER BY lhp.MaHK DESC, lhp.MaLHP ASC
    `);

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Lỗi getLopHocPhanForAdmin:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// 2) Mở/Khoá sổ điểm theo LHP
exports.toggleSoDiem = async (req, res) => {
  try {
    const { MaLHP, TrangThai } = req.body; // 'Mo' | 'Khoa'
    if (!MaLHP || !TrangThai) {
      return res.json({ success: false, message: "Thiếu MaLHP/TrangThai" });
    }

    await db.execute(
      `UPDATE lophocphan SET TrangThaiSoDiem = ? WHERE MaLHP = ?`,
      [TrangThai, MaLHP]
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("Lỗi toggleSoDiem:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// 3) Lịch sử sửa điểm theo LHP
exports.getLichSuDiemTheoLHP = async (req, res) => {
  try {
    const { MaLHP } = req.params;

    const [rows] = await db.execute(`
      SELECT 
        nk.ThoiGian,
        nk.NguoiSua,
        sv.MaSV,
        sv.HoTen,
        nk.NoiDung
      FROM nhatkydiem nk
      JOIN bangdiem bd ON nk.BangDiemID = bd.ID
      JOIN dangkyhocphan dk ON bd.DangKyID = dk.ID
      JOIN sinhvien sv ON dk.MaSV = sv.MaSV
      WHERE dk.MaLHP = ?
      ORDER BY nk.ThoiGian DESC
    `, [MaLHP]);

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Lỗi getLichSuDiemTheoLHP:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
exports.getLichSuDiemTheoLHP = async (req, res) => {
  const { MaLHP } = req.params;

  // lấy MaHK của lớp học phần
  const [[lhp]] = await db.execute(`SELECT MaHK FROM lophocphan WHERE MaLHP = ?`, [MaLHP]);
  if (!lhp) return res.json({ success: true, data: [] });

  const [rows] = await db.execute(`
    SELECT 
      nk.ThoiGian,
      nk.NguoiSua,
      sv.MaSV,
      sv.HoTen,
      nk.NoiDung
    FROM nhatkydiem nk
    JOIN bangdiem bd ON nk.BangDiemID = bd.ID
    JOIN dangkyhocphan dk ON bd.DangKyID = dk.ID
    JOIN sinhvien sv ON dk.MaSV = sv.MaSV
    WHERE dk.MaLHP = ? AND dk.MaHK = ?
    ORDER BY nk.ThoiGian DESC
  `, [MaLHP, lhp.MaHK]);

  res.json({ success: true, data: rows });
};
