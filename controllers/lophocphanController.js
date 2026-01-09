// controllers/lophocphanController.js
const db = require('../config/db');
const xlsx = require('xlsx');

// 1. Lấy danh sách LHP (kèm tìm kiếm)
exports.getAllLHP = async (req, res) => {
    try {
        const { search, type } = req.query;
        let sql = `
            SELECT lhp.*, mh.TenMH, gv.HoTen as TenGV, 
                   lh.Thu, lh.TietBatDau, lh.TietKetThuc, lh.MaPhong, ph.TenPhong
            FROM lophocphan lhp
            JOIN monhoc mh ON lhp.MaMH = mh.MaMH
            LEFT JOIN giangvien gv ON lhp.MaGV = gv.MaGV
            LEFT JOIN lichhoc lh ON lhp.MaLHP = lh.MaLHP 
            LEFT JOIN phonghoc ph ON lh.MaPhong = ph.MaPhong
        `;

        const params = [];
        if (search) {
            if (type === 'MaLHP') {
                sql += ` WHERE lhp.MaLHP LIKE ?`;
                params.push(`%${search}%`);
            } else if (type === 'TenMH') {
                sql += ` WHERE mh.TenMH LIKE ?`;
                params.push(`%${search}%`);
            }
        }
        
        sql += ` ORDER BY lhp.MaLHP DESC`;

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (error) {
        console.error("Lỗi getALLLHP:", error);
        res.status(500).json({ message: 'Lỗi server khi tải danh sách lớp.' });
    }
};

// 2. Lấy dữ liệu Metadata (Dropdown)
exports.getMetadata = async (req, res) => {
    try {
        const [monhoc] = await db.query("SELECT MaMH, TenMH FROM monhoc ORDER BY TenMH ASC");
        const [giangvien] = await db.query("SELECT MaGV, HoTen FROM giangvien WHERE TrangThai='Active'");
        const [hocky] = await db.query("SELECT MaHK, TenHK FROM hocky ORDER BY MaHK DESC");
        const [phonghoc] = await db.query("SELECT MaPhong, TenPhong FROM phonghoc");
        
        res.json({ monhoc, giangvien, hocky, phonghoc });
    } catch (error) {
        console.error("Lỗi metadata:", error);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu danh mục.' });
    }
};

// 3. Thêm mới LHP
exports.createLHP = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { MaLHP, MaMH, MaHK, MaGV, SiSoToiDa, MaPhong, Thu, TietBD, TietKT } = req.body;

        // Validation cơ bản
        if (!MaLHP || !MaMH || !MaHK) {
            throw new Error("Thiếu thông tin bắt buộc (Mã LHP, Môn học, Học kỳ)");
        }

        // Insert lophocphan
        await conn.query(
            `INSERT INTO lophocphan (MaLHP, MaMH, MaHK, MaGV, SiSoToiDa, SiSoHienTai, TrangThai) 
             VALUES (?, ?, ?, ?, ?, 0, 'DangMo')`,
            [MaLHP, MaMH, MaHK, MaGV || null, SiSoToiDa || 50]
        );

        // Insert lichhoc (Nếu có phòng và thứ)
        if (MaPhong && Thu) {
            await conn.query(
                `INSERT INTO lichhoc (MaLHP, Thu, TietBatDau, TietKetThuc, MaPhong) 
                 VALUES (?, ?, ?, ?, ?)`,
                [MaLHP, Thu, TietBD, TietKT, MaPhong]
            );
        }

        await conn.commit();
        res.json({ message: 'Thêm lớp học phần thành công!' });
    } catch (error) {
        await conn.rollback();
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ message: 'Mã lớp học phần đã tồn tại!' });
        } else {
            res.status(500).json({ message: error.message || 'Lỗi hệ thống' });
        }
    } finally {
        conn.release();
    }
};

// 4. Cập nhật LHP
exports.updateLHP = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { MaLHP, MaMH, MaHK, MaGV, SiSoToiDa, MaPhong, Thu, TietBD, TietKT } = req.body;

        // Update lophocphan
        await conn.query(
            `UPDATE lophocphan SET MaMH=?, MaHK=?, MaGV=?, SiSoToiDa=? WHERE MaLHP=?`,
            [MaMH, MaHK, MaGV || null, SiSoToiDa, MaLHP]
        );

        // Xử lý Lịch học: Kiểm tra xem đã có lịch chưa
        const [checkLich] = await conn.query("SELECT ID FROM lichhoc WHERE MaLHP = ?", [MaLHP]);
        
        if (checkLich.length > 0) {
            // Đã có -> Update
            await conn.query(
                `UPDATE lichhoc SET Thu=?, TietBatDau=?, TietKetThuc=?, MaPhong=? WHERE MaLHP=?`,
                [Thu, TietBD, TietKT, MaPhong, MaLHP]
            );
        } else {
            // Chưa có mà giờ có nhập -> Insert
            if (MaPhong && Thu) {
                await conn.query(
                    `INSERT INTO lichhoc (MaLHP, Thu, TietBatDau, TietKetThuc, MaPhong) VALUES (?, ?, ?, ?, ?)`,
                    [MaLHP, Thu, TietBD, TietKT, MaPhong]
                );
            }
        }

        await conn.commit();
        res.json({ message: 'Cập nhật thành công!' });
    } catch (error) {
        await conn.rollback();
        console.error(error);
        res.status(500).json({ message: 'Lỗi cập nhật dữ liệu.' });
    } finally {
        conn.release();
    }
};

// 5. Xóa LHP
exports.deleteLHP = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { id } = req.params; 

        // 1. Xóa lịch học
        await conn.query("DELETE FROM lichhoc WHERE MaLHP = ?", [id]);
        
        // 2. Xóa đăng ký học phần (Nếu muốn xóa sạch, cẩn thận mất dữ liệu lịch sử)
        // await conn.query("DELETE FROM dangkyhocphan WHERE MaLHP = ?", [id]);

        // 3. Xóa lớp học phần
        await conn.query("DELETE FROM lophocphan WHERE MaLHP = ?", [id]);

        await conn.commit();
        res.json({ message: 'Đã xóa lớp học phần!' });
    } catch (error) {
        await conn.rollback();
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
             res.status(400).json({ message: 'Không thể xóa: Đã có sinh viên đăng ký hoặc có dữ liệu điểm liên quan.' });
        } else {
             res.status(500).json({ message: 'Lỗi xóa dữ liệu.' });
        }
    } finally {
        conn.release();
    }
};

// 6. Nhập từ Excel
exports.importExcel = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Chưa chọn file Excel' });
    
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        /* Giả định file Excel có header: 
           MaLHP | MaMH | MaHK | MaGV | SiSo | Thu | TietBD | TietKT | MaPhong
        */

        let count = 0;
        let errors = [];

        for (const row of data) {
            // Check trùng MaLHP
            const [exists] = await conn.query("SELECT MaLHP FROM lophocphan WHERE MaLHP = ?", [row.MaLHP]);
            if (exists.length > 0) {
                errors.push(`Mã ${row.MaLHP} đã tồn tại`);
                continue;
            }

            try {
                // Insert LHP
                await conn.query(
                    `INSERT INTO lophocphan (MaLHP, MaMH, MaHK, MaGV, SiSoToiDa, SiSoHienTai, TrangThai) 
                     VALUES (?, ?, ?, ?, ?, 0, 'DangMo')`,
                    [row.MaLHP, row.MaMH, row.MaHK, row.MaGV || null, row.SiSo || 50]
                );

                // Insert Lich
                if (row.MaPhong && row.Thu) {
                     await conn.query(
                        `INSERT INTO lichhoc (MaLHP, Thu, TietBatDau, TietKetThuc, MaPhong) 
                         VALUES (?, ?, ?, ?, ?)`,
                        [row.MaLHP, row.Thu, row.TietBD, row.TietKT, row.MaPhong]
                    );
                }
                count++;
            } catch (err) {
                errors.push(`Lỗi dòng ${row.MaLHP}: ${err.message}`);
            }
        }

        await conn.commit();
        res.json({ 
            message: `Đã nhập thành công ${count} lớp.`,
            errors: errors.length > 0 ? errors : null 
        });

    } catch (error) {
        await conn.rollback();
        console.error(error);
        res.status(500).json({ message: 'Lỗi xử lý file Excel' });
    } finally {
        conn.release();
    }
};