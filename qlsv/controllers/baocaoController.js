const db = require("../config/db");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");


exports.getThongKe = async (req, res) => {
    try {
        const { khoa, nganh, monhoc, lhp, hocky, keyword } = req.query;

        let sql = `
        SELECT
            sv.MaSV AS MSSV,
            sv.HoTen,
            k.MaKhoa AS Khoa,
            n.MaNganh AS Nganh,
            mh.TenMH AS MonHoc,
            lhp.MaLHP AS LopHP,
            lhp.MaHK AS HocKy,
            mh.SoTC AS TinChi,
            bd.DiemQT AS GK,
            bd.DiemCK AS CK,
            ROUND(bd.DiemTK10, 2) AS TongKet,
            bd.KetQua
        FROM bangdiem bd
        JOIN dangkyhocphan dk ON bd.DangKyID = dk.ID
        JOIN sinhvien sv ON dk.MaSV = sv.MaSV
        JOIN lophocphan lhp ON dk.MaLHP = lhp.MaLHP
        JOIN monhoc mh ON lhp.MaMH = mh.MaMH
        JOIN nganh n ON sv.MaNganh = n.MaNganh
        JOIN khoa k ON n.MaKhoa = k.MaKhoa
        WHERE 1=1
        `;

        const params = [];

        if (khoa !== "") {
            sql += " AND k.MaKhoa = ?";
            params.push(khoa);
        }

        if (nganh !== "") {
            sql += " AND n.MaNganh = ?";
            params.push(nganh);
        }

        if (monhoc !== "") {
            sql += " AND mh.MaMH = ?";
            params.push(monhoc);
        }

        if (lhp !== "") {
            sql += " AND lhp.MaLHP = ?";
            params.push(lhp);
        }

        if (hocky !== "") {
            sql += " AND lhp.MaHK = ?";
            params.push(hocky);
        }

        if (keyword && keyword.trim() !== "") {
            sql += " AND (sv.MaSV LIKE ? OR sv.HoTen LIKE ?)";
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        const [rows] = await db.query(sql, params);
        res.json(rows);

    } catch (err) {
        console.error("❌ getThongKe error:", err);
        res.status(500).json(err);
    }
};

exports.getFilters = async (req, res) => {
    try {
        const [khoa]  = await db.query("SELECT MaKhoa, TenKhoa FROM khoa");
        const [nganh] = await db.query("SELECT MaNganh, TenNganh FROM nganh");
        const [monhoc]= await db.query("SELECT MaMH, TenMH FROM monhoc");
        const [lhp]   = await db.query("SELECT MaLHP FROM lophocphan");
        const [hocky] = await db.query("SELECT MaHK FROM hocky");

        res.json({ khoa, nganh, monhoc, lhp, hocky });
    } catch (err) {
        console.error("❌ getFilters error:", err);
        res.status(500).json(err);
    }
};
exports.exportExcel = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                sv.MaSV,
                sv.HoTen,
                k.MaKhoa,
                n.MaNganh,
                mh.TenMH,
                lhp.MaLHP,
                lhp.MaHK,
                mh.SoTC,
                bd.DiemQT,
                bd.DiemCK,
                bd.DiemTK10,
                bd.KetQua
            FROM bangdiem bd
            JOIN dangkyhocphan dk ON bd.DangKyID = dk.ID
            JOIN sinhvien sv ON dk.MaSV = sv.MaSV
            JOIN lophocphan lhp ON dk.MaLHP = lhp.MaLHP
            JOIN monhoc mh ON lhp.MaMH = mh.MaMH
            JOIN nganh n ON sv.MaNganh = n.MaNganh
            JOIN khoa k ON n.MaKhoa = k.MaKhoa
        `);

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("Báo cáo học tập");

        ws.columns = [
            { header: "MSSV", key: "MaSV", width: 12 },
            { header: "Họ tên", key: "HoTen", width: 20 },
            { header: "Khoa", key: "MaKhoa", width: 10 },
            { header: "Ngành", key: "MaNganh", width: 12 },
            { header: "Môn học", key: "TenMH", width: 25 },
            { header: "LHP", key: "MaLHP", width: 12 },
            { header: "Học kỳ", key: "MaHK", width: 12 },
            { header: "Tín chỉ", key: "SoTC", width: 8 },
            { header: "GK", key: "DiemQT", width: 8 },
            { header: "CK", key: "DiemCK", width: 8 },
            { header: "Tổng kết", key: "DiemTK10", width: 10 },
            { header: "Kết quả", key: "KetQua", width: 10 }
        ];

        ws.addRows(rows);

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=baocao_hoctap.xlsx"
        );

        await wb.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};
exports.exportPDF = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT sv.MaSV, sv.HoTen, mh.TenMH, bd.DiemTK10, bd.KetQua
            FROM bangdiem bd
            JOIN dangkyhocphan dk ON bd.DangKyID = dk.ID
            JOIN sinhvien sv ON dk.MaSV = sv.MaSV
            JOIN lophocphan lhp ON dk.MaLHP = lhp.MaLHP
            JOIN monhoc mh ON lhp.MaMH = mh.MaMH
        `);

        const doc = new PDFDocument({ margin: 30 });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=baocao.pdf");

        doc.pipe(res);

        doc.fontSize(16).text("BÁO CÁO KẾT QUẢ HỌC TẬP", { align: "center" });
        doc.moveDown();

        rows.forEach(r => {
            doc
                .fontSize(11)
                .text(`MSSV: ${r.MaSV} | ${r.HoTen} | ${r.TenMH} | ${r.DiemTK10} | ${r.KetQua}`);
        });

        doc.end();
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};
