const db = require("../config/db");

// =================== LẤY TẤT CẢ ĐIỂM ===================
exports.getAllScores = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                bd.ID,
                dk.MaLHP AS tenLopHP,
                sv.MaSV,
                sv.HoTen,
                mh.TenMH AS tenMH,
                bd.DiemQT,
                bd.DiemCK,
                bd.DiemTK10,
                bd.DiemChu,
                bd.KetQua,
                bd.IsLocked
            FROM bangdiem bd
            JOIN dangkyhocphan dk ON bd.DangKyID = dk.ID
            JOIN sinhvien sv ON sv.MaSV = dk.MaSV
            JOIN lophocphan lhp ON lhp.MaLHP = dk.MaLHP
            JOIN monhoc mh ON mh.MaMH = lhp.MaMH
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
};


// =================== TÌM KIẾM ===================
exports.searchScore = async (req, res) => {
    const { type, key } = req.query;
    const search = `%${key}%`;

    let where = "";
    if (type === "msv") where = "sv.MaSV LIKE ?";
    else if (type === "hoten") where = "sv.HoTen LIKE ?";
    else if (type === "malhp") where = "dk.MaLHP LIKE ?";
    else where = "sv.MaSV LIKE ?";

    try {
        const [rows] = await db.query(`
            SELECT 
                bd.ID,
                dk.MaLHP AS tenLopHP,
                sv.MaSV,
                sv.HoTen,
                mh.TenMH AS tenMH,
                bd.DiemQT,
                bd.DiemCK,
                bd.DiemTK10,
                bd.DiemChu,
                bd.KetQua,
                bd.IsLocked
            FROM bangdiem bd
            JOIN dangkyhocphan dk ON bd.DangKyID = dk.ID
            JOIN sinhvien sv ON sv.MaSV = dk.MaSV
            JOIN lophocphan lhp ON lhp.MaLHP = dk.MaLHP
            JOIN monhoc mh ON mh.MaMH = lhp.MaMH
            WHERE ${where}
        `, [search]);

        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
};
// =================== CẬP NHẬT ĐIỂM ===================
exports.updateScore = async (req, res) => {
    const { id, diemQT, diemCK } = req.body;

    try {
        // Lấy tỷ lệ tính điểm
        const [rows] = await db.query("SELECT TyLeQT, TyLeCK FROM bangdiem WHERE ID = ?", [id]);

        const TyLeQT = rows[0].TyLeQT;
        const TyLeCK = rows[0].TyLeCK;

        const diemTK10 = (diemQT * TyLeQT + diemCK * TyLeCK).toFixed(2);

        let diemChu = diemTK10 >= 8.5 ? "A" :
                      diemTK10 >= 7   ? "B" :
                      diemTK10 >= 5.5 ? "C" :
                      diemTK10 >= 4   ? "D" : "F";

        const ketQua = diemTK10 >= 4 ? "Đạt" : "Rớt";

        await db.query(`
            UPDATE bangdiem
            SET DiemQT=?, DiemCK=?, DiemTK10=?, DiemChu=?, KetQua=?
            WHERE ID=?
        `, [diemQT, diemCK, diemTK10, diemChu, ketQua, id]);

        res.json({ message: "Cập nhật điểm thành công!" });
    } catch (err) {
        res.status(500).json(err);
    }
};


// =================== KHOÁ 1 DÒNG ===================
exports.lockScore = async (req, res) => {
    try {
        await db.query("UPDATE bangdiem SET IsLocked = 1 WHERE ID = ?", [req.body.id]);
        res.json({ message: "Đã khoá điểm!" });
    } catch (err) {
        res.status(500).json(err);
    }
};


// =================== KHOÁ TOÀN BỘ ===================
exports.lockAllScores = async (req, res) => {
    try {
        await db.query("UPDATE bangdiem SET IsLocked = 1");
        res.json({ message: "Khoá toàn bộ điểm thành công!" });
    } catch (err) {
        res.status(500).json(err);
    }
};


// =================== MỞ KHOÁ TOÀN BỘ ===================
exports.unlockAllScores = async (req, res) => {
    try {
        await db.query("UPDATE bangdiem SET IsLocked = 0");
        res.json({ message: "Mở khoá điểm thành công!" });
    } catch (err) {
        res.status(500).json(err);
    }
};


// =================== LỊCH SỬ (TẠM THỜI) ===================
exports.getHistory = (req, res) => {
    res.json([]);   // chưa dùng
};
