const db = require('../config/db');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();

// ================= MAIL CONFIG =================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// =================================================
// 1. GỬI OTP (SINH VIÊN + GIẢNG VIÊN)
// =================================================
exports.sendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        let username = null;

        // ===== CHECK SINH VIÊN =====
        const [svRows] = await db.execute(
            `
            SELECT tk.Username
            FROM sinhvien sv
            JOIN taikhoan tk ON sv.MaSV = tk.MaSV
            WHERE sv.Email = ?
            `,
            [email]
        );

        if (svRows.length > 0) {
            username = svRows[0].Username;
        }

        // ===== CHECK GIẢNG VIÊN =====
        if (!username) {
            const [gvRows] = await db.execute(
                `
                SELECT tk.Username
                FROM giangvien gv
                JOIN taikhoan tk ON gv.MaGV = tk.MaGV
                WHERE gv.Email = ?
                `,
                [email]
            );

            if (gvRows.length > 0) {
                username = gvRows[0].Username;
            }
        }

        if (!username) {
            return res.status(404).json({
                success: false,
                message: 'Email không tồn tại trong hệ thống'
            });
        }

        // ===== SINH OTP =====
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiredAt = new Date(Date.now() + 5 * 60 * 1000);

        // ===== XOÁ OTP CŨ =====
        await db.execute(
            `DELETE FROM password_otp WHERE username = ?`,
            [username]
        );

        // ===== LƯU OTP =====
        await db.execute(
            `
            INSERT INTO password_otp (username, otp, expired_at)
            VALUES (?, ?, ?)
            `,
            [username, otp, expiredAt]
        );

        // ===== GỬI MAIL =====
        await transporter.sendMail({
            from: `"QLSV Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Mã OTP khôi phục mật khẩu',
            html: `
                <p>Mã OTP của bạn là:</p>
                <h2 style="color:blue">${otp}</h2>
                <p>OTP có hiệu lực trong 5 phút.</p>
            `
        });

        res.json({
            success: true,
            message: 'OTP đã được gửi',
            username: username
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// =================================================
// 2. XÁC THỰC OTP
// =================================================
exports.verifyOtp = async (req, res) => {
    const { username, otp } = req.body;

    try {
        const [rows] = await db.execute(
            `SELECT * FROM password_otp WHERE username = ? AND used = 0`,
            [username]
        );

        if (rows.length === 0) {
            return res.status(400).json({ success: false, message: 'OTP không tồn tại' });
        }

        const record = rows[0];

        if (new Date() > new Date(record.expired_at)) {
            return res.status(400).json({ success: false, message: 'OTP đã hết hạn' });
        }

        if (record.otp !== otp) {
            return res.status(400).json({ success: false, message: 'OTP không đúng' });
        }

        res.json({ success: true, message: 'Xác thực OTP thành công' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// =================================================
// 3. ĐỔI MẬT KHẨU
// =================================================
exports.resetPassword = async (req, res) => {
    const { username, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Mật khẩu không khớp' });
    }

    try {
        const [rows] = await db.execute(
            `SELECT * FROM password_otp WHERE username = ? AND used = 0`,
            [username]
        );

        if (rows.length === 0) {
            return res.status(403).json({ message: 'Chưa xác thực OTP' });
        }

        const otpRecord = rows[0];

        if (new Date() > new Date(otpRecord.expired_at)) {
            return res.status(403).json({ message: 'OTP đã hết hạn' });
        }

        const hash = await bcrypt.hash(newPassword, 10);

        await db.execute(
            `UPDATE taikhoan SET MatKhauHash = ? WHERE Username = ?`,
            [hash, username]
        );

        await db.execute(
            `UPDATE password_otp SET used = 1 WHERE id = ?`,
            [otpRecord.id]
        );

        res.json({ success: true, message: 'Đổi mật khẩu thành công' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
