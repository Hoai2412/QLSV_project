// controllers/dangkylhpController.js
const db = require('../config/db');

// Lấy danh sách đợt đăng ký (kèm tìm kiếm)
exports.getDotDKHP = async (req, res) => {
    try {
        const { keyword, type } = req.query;
        let sql = `
            SELECT d.*, h.TenHK, n.MoTa as TenNamHoc 
            FROM dotdangky d
            JOIN hocky h ON d.MaHK = h.MaHK
            JOIN namhoc n ON h.MaNamHoc = n.MaNamHoc
            WHERE 1=1
        `;
        
        const params = [];

        if (keyword && keyword.trim() !== '') {
            if (type === 'tendot') {
                sql += ` AND d.TenDot LIKE ?`;
                params.push(`%${keyword}%`);
            } else if (type === 'namhoc') {
                sql += ` AND n.MoTa LIKE ?`; // Tìm theo tên năm học (vd: 2024)
                params.push(`%${keyword}%`);
            } else if (type === 'hocky') {
                sql += ` AND h.TenHK LIKE ?`;
                params.push(`%${keyword}%`);
            }
        }

        sql += ` ORDER BY d.NgayBatDau DESC`;

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi tải dữ liệu' });
    }
};

// Thêm mới đợt đăng ký
exports.createDotDKHP = async (req, res) => {
    try {
        // Nhận namHoc (VD: "2025-2026") và tenHK (VD: "HK01") từ client
        const { tenDot, namHoc, tenHK, ngayBD, ngayKT, tinChi } = req.body;
        
        // 1. Log ra để debug xem dữ liệu client gửi lên là gì
        console.log("Dữ liệu nhận được:", req.body);

        if (!tenDot || !namHoc || !tenHK || !ngayBD || !ngayKT) {
            return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin' });
        }

        // BƯỚC 1: Tìm MaHK dựa trên Năm Học và Tên Học Kỳ
        // Logic: Join bảng hocky và namhoc để tìm mã
        const sqlFindHK = `
            SELECT h.MaHK 
            FROM hocky h 
            JOIN namhoc n ON h.MaNamHoc = n.MaNamHoc 
            WHERE n.MoTa LIKE ? AND h.TenHK = ?
            LIMIT 1
        `;
        
        // Lưu ý: Trong DB của bạn, n.MoTa lưu dạng "Năm học 2024 - 2025" 
        // hoặc user nhập "2024-2025". Ta dùng LIKE để tìm linh hoạt.
        const [hkRows] = await db.query(sqlFindHK, [`%${namHoc}%`, tenHK]);

        // Nếu không tìm thấy, trả về lỗi rõ ràng thay vì để server crash
        if (hkRows.length === 0) {
            return res.status(400).json({ 
                message: `Không tìm thấy Học kỳ ${tenHK} của năm học ${namHoc} trong hệ thống. Vui lòng kiểm tra lại cấu hình năm học/học kỳ.` 
            });
        }

        const maHKTimDuoc = hkRows[0].MaHK;

        // BƯỚC 2: Lưu đợt đăng ký
        const sqlInsert = `INSERT INTO dotdangky (TenDot, MaHK, NgayBatDau, NgayKetThuc, HanMucTinChi) VALUES (?, ?, ?, ?, ?)`;
        
        await db.query(sqlInsert, [tenDot, maHKTimDuoc, ngayBD, ngayKT, tinChi || 20]);

        res.json({ message: 'Thêm đợt đăng ký thành công!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi lưu đợt đăng ký' });
    }
};

// Lấy danh sách học kỳ để đổ vào Dropdown
exports.getHocKyList = async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT h.MaHK, h.TenHK, n.MoTa FROM hocky h JOIN namhoc n ON h.MaNamHoc = n.MaNamHoc ORDER BY h.MaHK DESC`);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy học kỳ' });
    }
}


// 1. Lấy chi tiết 1 đợt đăng ký theo ID (Để đổ dữ liệu vào form sửa)
exports.getDotById = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT d.*, h.TenHK, n.MoTa as TenNamHoc 
            FROM dotdangky d
            JOIN hocky h ON d.MaHK = h.MaHK
            JOIN namhoc n ON h.MaNamHoc = n.MaNamHoc
            WHERE d.ID = ?
        `;
        const [rows] = await db.query(sql, [id]);
        
        if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy" });
        
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

// 2. Cập nhật đợt đăng ký
exports.updateDotDKHP = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenDot, namHoc, tenHK, ngayBD, ngayKT, tinChi } = req.body;

        // Logic tìm MaHK tương tự như lúc tạo mới (vì người dùng có thể sửa năm/học kỳ)
        const sqlFindHK = `
            SELECT h.MaHK 
            FROM hocky h 
            JOIN namhoc n ON h.MaNamHoc = n.MaNamHoc 
            WHERE n.MoTa LIKE ? AND h.TenHK = ?
            LIMIT 1
        `;
        const [hkRows] = await db.query(sqlFindHK, [`%${namHoc}%`, tenHK]);

        if (hkRows.length === 0) {
            return res.status(400).json({ message: "Không tìm thấy năm học/học kỳ này trong hệ thống." });
        }
        const maHKMoi = hkRows[0].MaHK;

        // Cập nhật Database
        const sqlUpdate = `
            UPDATE dotdangky 
            SET TenDot=?, MaHK=?, NgayBatDau=?, NgayKetThuc=?, HanMucTinChi=?
            WHERE ID=?
        `;
        await db.query(sqlUpdate, [tenDot, maHKMoi, ngayBD, ngayKT, tinChi, id]);

        res.json({ message: "Cập nhật thành công!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi cập nhật" });
    }
};

// 3. Xóa đợt đăng ký
exports.deleteDotDKHP = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM dotdangky WHERE ID = ?", [id]);
        res.json({ message: "Đã xóa thành công!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi xóa (Có thể dữ liệu đang được sử dụng)" });
    }
};
 
// Tìm kiếm đăng ký học phần
exports.getAll = (req, res) => {
    const { keyword = '', type = 'tendot' } = req.query;

    let where = '';
    let params = [];

    if (keyword) {
        switch (type) {
            case 'tendot':
                where = 'WHERE TenDot LIKE ?';
                params.push(`%${keyword}%`);
                break;

            case 'namhoc':
                where = 'WHERE TenNamHoc LIKE ?';
                params.push(`%${keyword}%`);
                break;

            case 'hocky':
                where = 'WHERE TenHK LIKE ?';
                params.push(`%${keyword}%`);
                break;
        }
    }

    const sql = `
        SELECT *
        FROM dangkylhp
        ${where}
        ORDER BY NgayBatDau DESC
    `;

    db.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
};
