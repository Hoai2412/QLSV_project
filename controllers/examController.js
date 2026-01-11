//examController
const db = require("../config/db");

// =============================
// GET TẤT CẢ LỊCH THI
// =============================
// =============================
// GET TẤT CẢ LỊCH THI (CÓ SEARCH + FILTER)
// =============================
exports.getAll = async (req, res) => {
  try {
    const { hocKy = "", maMH = "", maLHP = "", monThi = "" } = req.query;

    let sql = `
      SELECT 
        lt.ID,
        lt.HocKy,
        lt.MaLHP,
        lhp.MaMH,
        mh.TenMH,
        k.TenKhoa,
        lt.NgayThi,
        lt.PhongThi,
        lt.CaThi,
        lt.GiamThi
      FROM lichthi lt
      JOIN lophocphan lhp ON lhp.MaLHP = lt.MaLHP
      JOIN monhoc mh ON mh.MaMH = lhp.MaMH
      LEFT JOIN nganh n ON n.MaNganh = mh.MaNganh
      LEFT JOIN khoa  k ON k.MaKhoa = n.MaKhoa
      WHERE 1=1
    `;
    const params = [];

    if (hocKy) { sql += " AND lt.HocKy = ?"; params.push(hocKy); }
    if (maLHP) { sql += " AND lt.MaLHP = ?"; params.push(maLHP); }
    if (maMH)  { sql += " AND lhp.MaMH = ?"; params.push(maMH); }

    // ✅ search mềm theo tên/mã (khi không parse ra maMH)
    if (monThi) {
      sql += " AND (mh.TenMH LIKE ? OR lhp.MaMH LIKE ?)";
      params.push(`%${monThi}%`, `%${monThi}%`);
    }

    sql += " ORDER BY lt.NgayThi";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

// GET /api/lichthi/lophocphan/:hocKy
exports.getLopHocPhanByHocKy = async (req, res) => {
  try {
    const { hocKy } = req.params;

    const [rows] = await db.query(`
      SELECT 
        lhp.MaLHP,
        lhp.MaMH,
        mh.TenMH,
        k.MaKhoa,
        k.TenKhoa
      FROM lophocphan lhp
      JOIN monhoc mh ON mh.MaMH = lhp.MaMH
      LEFT JOIN nganh n ON n.MaNganh = mh.MaNganh
      LEFT JOIN khoa  k ON k.MaKhoa = n.MaKhoa
      WHERE lhp.MaHK = ?
      ORDER BY mh.TenMH, lhp.MaLHP
    `, [hocKy]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

// GET /api/lichthi/lophocphan?hocKy=...&maKhoa=...
exports.getLopHocPhanByHocKyKhoa = async (req, res) => {
  try {
    const { hocKy = "", maKhoa = "" } = req.query;
    if (!hocKy || !maKhoa) return res.json([]);

    const [rows] = await db.query(`
      SELECT 
        lhp.MaLHP,
        lhp.MaMH,
        mh.TenMH,
        k.MaKhoa,
        k.TenKhoa
      FROM lophocphan lhp
      JOIN monhoc mh ON mh.MaMH = lhp.MaMH
      LEFT JOIN nganh n ON n.MaNganh = mh.MaNganh
      LEFT JOIN khoa  k ON k.MaKhoa = n.MaKhoa
      WHERE lhp.MaHK = ?
        AND k.MaKhoa = ?
      ORDER BY mh.TenMH, lhp.MaLHP
    `, [hocKy, maKhoa]);

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
// POST /api/lichthi
// POST /api/lichthi
exports.add = async (req, res) => {
  try {
    const { HocKy, MaLHP, NgayThi, PhongThi, CaThi, GiamThi } = req.body;

    const [[lhp]] = await db.query(`
      SELECT lhp.MaLHP, lhp.MaHK, mh.TenMH
      FROM lophocphan lhp
      JOIN monhoc mh ON mh.MaMH = lhp.MaMH
      WHERE lhp.MaLHP = ?
      LIMIT 1
    `, [MaLHP]);

    if (!lhp) return res.status(400).json({ message: "MaLHP không tồn tại!" });
    if (lhp.MaHK !== HocKy) {
      return res.status(400).json({ message: "Lớp học phần không thuộc học kỳ đã chọn!" });
    }

    const [[dup]] = await db.query(
      "SELECT COUNT(*) AS total FROM lichthi WHERE MaLHP=?",
      [MaLHP]
    );
    if (dup.total > 0) {
      return res.status(400).json({ message: "❌ Lớp học phần này đã có lịch thi!" });
    }

    await db.query(`
      INSERT INTO lichthi (HocKy, MaLHP, MonThi, NgayThi, PhongThi, CaThi, GiamThi)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [HocKy, MaLHP, lhp.TenMH, NgayThi, PhongThi, CaThi, GiamThi]);

    res.json({ message: "Thêm lịch thi thành công!" });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};


// =============================
// SỬA LỊCH THI
// =============================
// PUT /api/lichthi/:id
// PUT /api/lichthi/:id
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { HocKy, MaLHP, NgayThi, PhongThi, CaThi, GiamThi } = req.body;

    const [[lhp]] = await db.query(`
      SELECT lhp.MaLHP, lhp.MaHK, mh.TenMH
      FROM lophocphan lhp
      JOIN monhoc mh ON mh.MaMH = lhp.MaMH
      WHERE lhp.MaLHP = ?
      LIMIT 1
    `, [MaLHP]);

    if (!lhp) return res.status(400).json({ message: "MaLHP không tồn tại!" });
    if (lhp.MaHK !== HocKy) {
      return res.status(400).json({ message: "Lớp học phần không thuộc học kỳ đã chọn!" });
    }

    const [[dup]] = await db.query(
      "SELECT COUNT(*) AS total FROM lichthi WHERE MaLHP=? AND ID<>?",
      [MaLHP, id]
    );
    if (dup.total > 0) {
      return res.status(400).json({ message: "❌ Lớp học phần này đã có lịch thi!" });
    }

    const [result] = await db.query(`
      UPDATE lichthi
      SET HocKy=?, MaLHP=?, MonThi=?, NgayThi=?, PhongThi=?, CaThi=?, GiamThi=?
      WHERE ID=?
    `, [HocKy, MaLHP, lhp.TenMH, NgayThi, PhongThi, CaThi, GiamThi, id]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "ID không tồn tại!" });

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

exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        lt.ID,
        lt.HocKy,
        lt.MaLHP,
        lhp.MaMH,
        mh.TenMH,
        k.MaKhoa,
        k.TenKhoa,
        lt.NgayThi,
        lt.PhongThi,
        lt.CaThi,
        lt.GiamThi
      FROM lichthi lt
      JOIN lophocphan lhp ON lhp.MaLHP = lt.MaLHP
      JOIN monhoc mh ON mh.MaMH = lhp.MaMH
      LEFT JOIN nganh n ON n.MaNganh = mh.MaNganh
      LEFT JOIN khoa  k ON k.MaKhoa = n.MaKhoa
      WHERE lt.ID = ?
      LIMIT 1
    `, [req.params.id]);

    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};




// =============================
// LOAD HỌC KỲ (HIỆN TẠI + TƯƠNG LAI)
// =============================
exports.getHocKyForm = async (req, res) => {
     try {
        const [rows] = await db.query(`
            SELECT MaHK
            FROM hocky
            ORDER BY MaNamHoc DESC, ThuTu DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
};
//
exports.getHocKyAll = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT MaHK
            FROM hocky
            ORDER BY MaNamHoc DESC, ThuTu DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
};


// =============================
// LOAD PHÒNG HỌC
// =============================
exports.getPhongHoc = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT MaPhong, TenPhong, CoSo
            FROM phonghoc
            ORDER BY MaPhong
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
};
//LOAD-KHOA_MON
exports.getKhoaList = async (req, res) => {
    const [rows] = await db.query(
        "SELECT MaKhoa, TenKhoa FROM khoa WHERE TrangThai='Active'"
    );
    res.json(rows);
};

exports.getMonByKhoa = async (req, res) => {
  const { maKhoa } = req.params;

  const [rows] = await db.query(
    `
    SELECT mh.MaMH, mh.TenMH
    FROM monhoc mh
    JOIN nganh n ON n.MaNganh = mh.MaNganh
    WHERE n.MaKhoa = ?
    ORDER BY mh.TenMH
    `,
    [maKhoa]
  );

  res.json(rows);
};

exports.getKhoaByMon = async (req, res) => {
    const { tenMon } = req.query;

    const [[row]] = await db.query(`
        SELECT k.MaKhoa
        FROM monhoc mh
        JOIN nganh n ON n.MaNganh = mh.MaNganh
        JOIN khoa k ON k.MaKhoa = n.MaKhoa
        WHERE mh.TenMH = ?
        LIMIT 1
    `, [tenMon]);

    res.json(row || {});
};


//CHECK TRÙNG 
// =============================
// CHECK TRÙNG PHÒNG + CA + NGÀY
// (DÙNG CHO ADD & EDIT)
// =============================
exports.checkTrungLichThi = async (req, res) => {
  try {
    const { NgayThi, PhongThi, CaThi, GiamThi, MaLHP, HocKy, id } = req.body;

    // ✅ Trường hợp UI chỉ gửi MaLHP để check nhanh
    if (MaLHP && !NgayThi && !PhongThi && !CaThi && !GiamThi) {
      let sql = `SELECT COUNT(*) AS total FROM lichthi WHERE MaLHP=?`;
      const p = [MaLHP];
      if (id) { sql += " AND ID <> ?"; p.push(id); }
      const [[r]] = await db.query(sql, p);
      return res.json({
        trungPhong: false,
        trungGiamThi: false,
        trungLopHocPhan: r.total > 0
      });
    }

    // 1) Trùng phòng + ca + ngày
    let sql1 = `
      SELECT COUNT(*) AS total
      FROM lichthi
      WHERE NgayThi=? AND PhongThi=? AND CaThi=?
    `;
    const p1 = [NgayThi, PhongThi, CaThi];
    if (id) { sql1 += " AND ID <> ?"; p1.push(id); }
    const [[r1]] = await db.query(sql1, p1);

    // 2) Trùng giám thị + ca + ngày
    let sql2 = `
      SELECT COUNT(*) AS total
      FROM lichthi
      WHERE NgayThi=? AND CaThi=? AND GiamThi=?
    `;
    const p2 = [NgayThi, CaThi, GiamThi];
    if (id) { sql2 += " AND ID <> ?"; p2.push(id); }
    const [[r2]] = await db.query(sql2, p2);

    // 3) ✅ 1 MaLHP chỉ 1 lịch thi (không cần HocKy)
    let sql3 = `
      SELECT COUNT(*) AS total
      FROM lichthi
      WHERE MaLHP=?
    `;
    const p3 = [MaLHP];
    if (id) { sql3 += " AND ID <> ?"; p3.push(id); }
    const [[r3]] = await db.query(sql3, p3);

    res.json({
      trungPhong: r1.total > 0,
      trungGiamThi: r2.total > 0,
      trungLopHocPhan: r3.total > 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};








