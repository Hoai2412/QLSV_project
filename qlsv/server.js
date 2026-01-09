// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const db = require('./config/db');

const app = express();
//const PORT = process.env.PORT || 3000;
// Đổi 3000 thành 3001
const PORT = process.env.PORT || 3000;
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
});

app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Session config
app.use(session({
    secret: 'secret_key_qlsv_2024',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set true nếu dùng HTTPS
}));

// Routes Imports
const authRoutes = require('./routes/authRoutes.js');
app.use('/api/auth', authRoutes);
const studentRoutes = require('./routes/studentRoutes');
app.use('/api/student', studentRoutes);
// THÊM GV
const giangvienRoutes = require('./routes/giangvienRoutes');
app.use('/giangvien', giangvienRoutes);
// ADMIN ROUTES
const adminRoutes = require('./routes/adminRoutes');
app.use('/admin', adminRoutes);

// DANH MỤC
const categoryRoutes = require("./routes/categoryRoutes");
app.use("/api/category", categoryRoutes);  // Thêm chữ "/category" vào đây để khớp với frontend
// LỚP HỌC PHẦN
const lophocphanRoutes = require("./routes/lophocphanRoutes");
app.use("/api", lophocphanRoutes);
// ĐĂNG KÝ HỌC PHẦN
const dangkylhpRoutes = require('./routes/dangkylhpRoutes');
app.use('/api/dangkylhp', dangkylhpRoutes);
// QUẢN LÝ NGƯỜI DÙNG
const nguoidungRoutes = require('./routes/nguoidungRoutes');
app.use('/api/users', nguoidungRoutes);
//lịch thi
const examRoutes = require("./routes/examRoutes");
app.use("/api/lichthi", examRoutes);

//Quản lý điểm
const diemRoutes = require("./routes/diemRoutes");
app.use("/api/diem", diemRoutes);
const baocaoRoutes = require("./routes/baocaoRoutes");
app.use("/api/baocao", baocaoRoutes);

// Frontend Routes (Điều hướng cơ bản)
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public/login.html'));
// });
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/student', (req, res) => {
    // Cần middleware check login ở đây thực tế
    res.sendFile(path.join(__dirname, 'public/views/dashboard.html'));
});

app.get('/student/schedule', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/schedule.html'));
});
app.get('/student/exam-schedule', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/exam-schedule.html'));
});

// ===== TRA CỨU HỌC PHẦN =====
app.get('/student/course-search', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public/views/course-search.html')
    );
});


app.get('/student/grades', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/grades.html'));
});

app.get('/student/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/register.html'));
});
// app.get('/student/history', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public/views/history.html'));
// });

app.get('/student/curriculum', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/curriculum.html'));
});

//THÊM GV

// Khi admin truy cập /admin/dashboard → load giao diện admin
app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/admin/admin-dashboard.html'));
});

app.get('/admin/diem', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/admin/diem.html'));
});


app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log(`Kết nối CSDL MySQL...`);
});

// Cho phép Express phục vụ folder views/admin
app.use('/views', express.static(path.join(__dirname, 'public', 'views')));


const passwordRoutes = require("./routes/passwordRoutes");
app.use("/api/password", passwordRoutes);
