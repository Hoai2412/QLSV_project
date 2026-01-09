//config/db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', // Điền pass mysql của bạn
    database: 'qlsv_monhoc',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Lỗi kết nối CSDL:', err.message);
    } else {
        console.log('Kết nối CSDL thành công!');
        connection.release();
    }
});

module.exports = pool.promise();