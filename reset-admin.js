// reset-admin.js
const db = require('./config/db');
const bcrypt = require('bcrypt');

async function resetAdmin() {
    try {
        console.log("Đang reset mật khẩu admin...");
        
        // 1. Tạo hash cho mật khẩu "123456"
        const hashedPassword = await bcrypt.hash("123456", 10);
        
        // 2. Cập nhật vào DB
        // Lưu ý: Đảm bảo trong DB bạn có user là 'admin' và VaiTro='Admin'
        await db.query(
            "UPDATE taikhoan SET MatKhauHash = ?, TrangThai='Active' WHERE Username = 'admin'", 
            [hashedPassword]
        );
        
        console.log(">>> THÀNH CÔNG! Mật khẩu của 'admin' đã được đổi thành: 123456");
        process.exit();
    } catch (err) {
        console.error("Lỗi:", err);
        process.exit(1);
    }
}

resetAdmin();