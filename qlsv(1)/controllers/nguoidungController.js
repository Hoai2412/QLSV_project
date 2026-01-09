// controllers/nguoidungController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// 1. Lấy danh sách người dùng (JOIN để lấy họ tên)
exports.getUsers = async (req, res) => {
    try {
        const { search, role } = req.query;
        
        // Query kết hợp bảng Sinhvien và Giangvien để lấy họ tên
        let sql = `
            SELECT 
                t.Username, 
                t.VaiTro, 
                t.TrangThai,
                CASE 
                    WHEN t.VaiTro = 'SinhVien' THEN sv.HoTen
                    WHEN t.VaiTro = 'GiangVien' THEN gv.HoTen
                    ELSE 'Quản trị viên' 
                END as HoTen
            FROM taikhoan t
            LEFT JOIN sinhvien sv ON t.MaSV = sv.MaSV
            LEFT JOIN giangvien gv ON t.MaGV = gv.MaGV
            WHERE 1=1
        `;
        
        let params = [];

        // Mapping giá trị filter từ frontend (sv, gv, admin) sang DB (SinhVien, GiangVien, Admin)
        if (role) {
            let dbRole = '';
            if (role === 'sv') dbRole = 'SinhVien';
            else if (role === 'gv') dbRole = 'GiangVien';
            else if (role === 'admin') dbRole = 'Admin';
            
            sql += " AND t.VaiTro = ?";
            params.push(dbRole);
        }

        if (search) {
            sql += " AND (t.Username LIKE ? OR sv.HoTen LIKE ? OR gv.HoTen LIKE ?)";
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        sql += " ORDER BY t.Username ASC";

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server: " + err.message });
    }
};

// 2. Lấy chi tiết 1 user
exports.getUserDetail = async (req, res) => {
    try {
        const { username } = req.params;
        const sql = `
            SELECT 
                t.Username, t.VaiTro, t.TrangThai,
                CASE 
                    WHEN t.VaiTro = 'SinhVien' THEN sv.HoTen
                    WHEN t.VaiTro = 'GiangVien' THEN gv.HoTen
                    ELSE 'Administrator' 
                END as HoTen
            FROM taikhoan t
            LEFT JOIN sinhvien sv ON t.MaSV = sv.MaSV
            LEFT JOIN giangvien gv ON t.MaGV = gv.MaGV
            WHERE t.Username = ?
        `;
        const [rows] = await db.query(sql, [username]);
        if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy tài khoản" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. Thêm tài khoản mới
exports.createUser = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // --- NHẬN THÊM MaNganh TỪ REQUEST ---
        const { Username, Password, HoTen, VaiTro, MaNganh } = req.body; 

        let dbRole = 'SinhVien';
        let maSV = null;
        let maGV = null;

        // --- TRƯỜNG HỢP 1: TẠO SINH VIÊN ---
        if (VaiTro === 'sv') {
            dbRole = 'SinhVien';
            maSV = Username;

            // Kiểm tra bắt buộc chọn ngành
            if (!MaNganh) throw new Error("Vui lòng chọn Ngành học cho Sinh viên!");

            const [checkSV] = await conn.query("SELECT MaSV FROM sinhvien WHERE MaSV = ?", [maSV]);
            
            if (checkSV.length === 0) {
                // SỬA: Insert MaNganh người dùng chọn (thay vì gán cứng)
                await conn.query(
                    `INSERT INTO sinhvien (MaSV, HoTen, MaNganh, TrangThai) VALUES (?, ?, ?, 'DangHoc')`,
                    [maSV, HoTen || 'Sinh viên mới', MaNganh]
                );
            } else {
                // Update nếu cần (tùy logic của bạn)
                if (HoTen) await conn.query("UPDATE sinhvien SET HoTen = ? WHERE MaSV = ?", [HoTen, maSV]);
            }
        } 
        // --- TRƯỜNG HỢP 2: TẠO GIẢNG VIÊN ---
        else if (VaiTro === 'gv') {
            dbRole = 'GiangVien';
            maGV = Username;
            
            // Nếu muốn bắt buộc giảng viên phải có Bộ môn (Ngành)
            if (!MaNganh) throw new Error("Vui lòng chọn Bộ môn (Ngành) cho Giảng viên!");

            const [checkGV] = await conn.query("SELECT MaGV FROM giangvien WHERE MaGV = ?", [maGV]);
            
            if (checkGV.length === 0) {
                // Insert thêm cột BoMon lấy giá trị từ MaNganh
                await conn.query(
                    `INSERT INTO giangvien (MaGV, HoTen, BoMon, TrangThai) VALUES (?, ?, ?, 'Active')`,
                    [maGV, HoTen || 'Giảng viên mới', MaNganh]
                );
            } else {
                 // Cập nhật cả họ tên và bộ môn nếu đã tồn tại
                 await conn.query(
                    "UPDATE giangvien SET HoTen = ?, BoMon = ? WHERE MaGV = ?", 
                    [HoTen || 'Giảng viên', MaNganh, maGV]
                );
            }
        }
        else {
            dbRole = 'Admin';
        }

        // Tạo tài khoản
        const hashedPassword = await bcrypt.hash(Password, saltRounds);
        await conn.query(
            `INSERT INTO taikhoan (Username, MatKhauHash, VaiTro, MaSV, MaGV, TrangThai) 
             VALUES (?, ?, ?, ?, ?, 'Active')`,
            [Username, hashedPassword, dbRole, maSV, maGV]
        );

        await conn.commit();
        res.json({ message: "Thêm người dùng thành công!" });

    } catch (err) {
        await conn.rollback();
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') res.status(400).json({ message: "Tài khoản đã tồn tại!" });
        else res.status(400).json({ message: err.message });
    } finally {
        conn.release();
    }
};

// 4. Cập nhật tài khoản (Đổi pass, trạng thái)
exports.updateUser = async (req, res) => {
    try {
        const { username } = req.params;
        const { Password, TrangThai } = req.body; 
        // Không cho phép đổi Username hay VaiTro vì ảnh hưởng khóa ngoại

        let sql = "UPDATE taikhoan SET TrangThai = ?";
        let params = [TrangThai || 'Active'];

        if (Password && Password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(Password, saltRounds);
            sql += ", MatKhauHash = ?";
            params.push(hashedPassword);
        }

        sql += " WHERE Username = ?";
        params.push(username);

        await db.query(sql, params);
        res.json({ message: "Cập nhật thành công!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 5. Xóa tài khoản
exports.deleteUser = async (req, res) => {
    try {
        const { username } = req.params;
        if (username === 'admin') return res.status(403).json({ message: "Không thể xóa Super Admin" });

        await db.query("DELETE FROM taikhoan WHERE Username = ?", [username]);
        res.json({ message: "Đã xóa tài khoản!" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi xóa: " + err.message });
    }
};

// 6. Lấy danh sách ngành cho combobox
exports.getMajors = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT MaNganh, TenNganh FROM nganh WHERE TrangThai = 'Active'");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy danh sách ngành: " + err.message });
    }
};


const xlsx = require('xlsx'); // Import thư viện đọc excel

exports.importUsersExcel = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Chưa chọn file Excel' });

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        
        // 1. Đọc file Excel từ bộ nhớ
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        let successCount = 0;
        let errors = [];
        
        // Hash mật khẩu mặc định 123456
        const defaultHash = await bcrypt.hash('123456', 10);

        for (const row of data) {
            // Excel cần các cột: Username, HoTen, VaiTro, MaNganh, MatKhau
            const { Username, HoTen, VaiTro, MaNganh, MatKhau } = row;
            
            if (!Username || !VaiTro) continue;

            try {
                let dbRole = 'SinhVien';
                let maSV = null;
                let maGV = null;
                const passHash = MatKhau ? await bcrypt.hash(String(MatKhau), 10) : defaultHash;

                // Xử lý tạo hồ sơ dựa trên vai trò
                if (VaiTro === 'sv') {
                    dbRole = 'SinhVien';
                    maSV = Username;
                    await conn.query(
                        `INSERT INTO sinhvien (MaSV, HoTen, MaNganh, TrangThai) 
                         VALUES (?, ?, ?, 'DangHoc') 
                         ON DUPLICATE KEY UPDATE HoTen = VALUES(HoTen)`,
                        [maSV, HoTen, MaNganh || 'CNTT'] 
                    );
                } 
                else if (VaiTro === 'gv') {
                    dbRole = 'GiangVien';
                    maGV = Username;
                    await conn.query(
                        `INSERT INTO giangvien (MaGV, HoTen, BoMon, TrangThai) 
                         VALUES (?, ?, ?, 'Active')
                         ON DUPLICATE KEY UPDATE HoTen = VALUES(HoTen)`,
                        [maGV, HoTen, MaNganh || 'CNTT']
                    );
                } 
                else if (VaiTro === 'admin') {
                    dbRole = 'Admin';
                }

                // Tạo tài khoản
                await conn.query(
                    `INSERT INTO taikhoan (Username, MatKhauHash, VaiTro, MaSV, MaGV, TrangThai) 
                     VALUES (?, ?, ?, ?, ?, 'Active')
                     ON DUPLICATE KEY UPDATE MatKhauHash = VALUES(MatKhauHash)`, 
                    [Username, passHash, dbRole, maSV, maGV]
                );

                successCount++;
            } catch (err) {
                errors.push(`Lỗi dòng ${Username}: ${err.message}`);
            }
        }

        await conn.commit();
        
        let msg = `Đã nhập thành công ${successCount} người dùng.`;
        if (errors.length > 0) msg += ` Có ${errors.length} lỗi (Xem console).`;
        
        res.json({ message: msg, errors: errors });

    } catch (error) {
        await conn.rollback();
        console.error(error);
        res.status(500).json({ message: 'Lỗi xử lý file Excel: ' + error.message });
    } finally {
        conn.release();
    }
};