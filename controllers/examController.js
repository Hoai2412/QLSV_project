const db = require("../config/db");

// =============================
// GET TẤT CẢ LỊCH THI
// =============================
// =============================
// GET TẤT CẢ LỊCH THI (CÓ SEARCH + FILTER)
// =============================
exports.getAll = async (req, res) => {
    try {
        const { hocKy = "", monThi = "" } = req.query;

        let sql = `
            SELECT 
                lt.ID,
                lt.HocKy,
                k.TenKhoa,
                lt.MonThi,
                lt.NgayThi,
                lt.PhongThi,
                lt.CaThi,
                lt.GiamThi
            FROM lichthi lt
            LEFT JOIN monhoc mh ON mh.TenMH = lt.MonThi
            LEFT JOIN nganh n ON n.MaNganh = mh.MaNganh
            LEFT JOIN khoa k ON k.MaKhoa = n.MaKhoa
            WHERE 1=1
        `;
        const params = [];

        if (hocKy) {
            sql += " AND lt.HocKy = ?";
            params.push(hocKy);
        }

        if (monThi) {
            sql += " AND lt.MonThi LIKE ?";
            params.push(`%${monThi}%`);
        }

        sql += " ORDER BY lt.NgayThi";

        const [rows] = await db.query(sql, params);
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

exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        lt.*,
        k.MaKhoa,
        k.TenKhoa
      FROM lichthi lt
      LEFT JOIN monhoc mh ON mh.TenMH = lt.MonThi
      LEFT JOIN nganh n ON n.MaNganh = mh.MaNganh
      LEFT JOIN khoa k ON k.MaKhoa = n.MaKhoa
      WHERE lt.ID = ?
      `,
      [req.params.id]
    );

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
// LOAD GIÁM THỊ
// =============================
exports.getGiamThi = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT MaGV, HoTen
            FROM giangvien
            WHERE TrangThai = 'Active'
            ORDER BY HoTen
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

    const [rows] = await db.query(`
        SELECT mh.TenMH
        FROM monhoc mh
        JOIN nganh n ON n.MaNganh = mh.MaNganh
        WHERE n.MaKhoa = ?
        ORDER BY mh.TenMH
    `, [maKhoa]);

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
        const { NgayThi, PhongThi, CaThi, id } = req.body;

        let sql = `
            SELECT COUNT(*) AS total
            FROM lichthi
            WHERE NgayThi = ?
              AND PhongThi = ?
              AND CaThi = ?
        `;
        const params = [NgayThi, PhongThi, CaThi];

        if (id) {
            sql += " AND ID <> ?";
            params.push(id);
        }

        const [[row]] = await db.query(sql, params);
        res.json({ trung: row.total > 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};



