const db = require("../config/db");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");



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
        const { sql, params } = buildThongKeQuery(req.query);
        const [rows] = await db.query(sql, params);

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("Báo cáo học tập");

        ws.columns = [
            { header: "MSSV", key: "MaSV", width: 12 },
            { header: "Họ tên", key: "HoTen", width: 20 },
            { header: "Khoa", key: "MaKhoa", width: 10 },
            { header: "Ngành", key: "MaNganh", width: 12 },
            { header: "Môn học", key: "TenMH", width: 25 },
            { header: "LHP", key: "MaLHP", width: 10 },
            { header: "Học kỳ", key: "MaHK", width: 12 },
            { header: "TC", key: "SoTC", width: 6 },
            { header: "GK", key: "DiemQT", width: 6 },
            { header: "CK", key: "DiemCK", width: 6 },
            { header: "Tổng kết", key: "DiemTK10", width: 10 },
            { header: "KQ", key: "KetQua", width: 10 }
        ];

        ws.addRows(rows);

        // 🔥 BẮT BUỘC
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
        console.error("❌ exportExcel:", err);
        res.status(500).json(err);
    }
};



exports.exportPDF = async (req, res) => {
  try {
    const { sql, params } = buildThongKeQuery(req.query);
    const [rows] = await db.query(sql, params);

    // A4 ngang để đủ cột
    const doc = new PDFDocument({ margin: 28, size: "A4", layout: "landscape" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=baocao_hoctap.pdf");
    doc.pipe(res);

    // Font unicode
    const fontPath = path.join(__dirname, "../assets/fonts/Roboto-Regular.ttf");
    if (!fs.existsSync(fontPath)) {
      console.error("❌ FONT NOT FOUND:", fontPath);
      return res.status(500).send("Font file not found");
    }
    doc.font(fontPath);

    // ===== Title =====
    doc.fontSize(16).text("BÁO CÁO KẾT QUẢ HỌC TẬP", { align: "center" });
    doc.moveDown(0.6);

    // ===== Filter line (nếu có) =====
    doc.fontSize(10).fillColor("#334155");
    const f = req.query;
    const filterLine = [
      f.khoa ? `Khoa: ${f.khoa}` : null,
      f.nganh ? `Ngành: ${f.nganh}` : null,
      f.monhoc ? `Môn: ${f.monhoc}` : null,
      f.lhp ? `LHP: ${f.lhp}` : null,
      f.hocky ? `HK: ${f.hocky}` : null,
      f.keyword ? `Từ khóa: ${f.keyword}` : null,
    ].filter(Boolean).join(" | ");
    if (filterLine) doc.text(filterLine);
    doc.moveDown(0.4);

    // ===== Table config =====
    const startX = doc.page.margins.left;
    const pageRight = doc.page.width - doc.page.margins.right;
    const tableW = pageRight - startX;

    // Cột (12 cột)
    const cols = [
      { key: "MaSV", header: "MSSV", w: 70, align: "left" },
      { key: "HoTen", header: "Họ tên", w: 120, align: "left" },
      { key: "MaKhoa", header: "Khoa", w: 60, align: "center" },
      { key: "MaNganh", header: "Ngành", w: 70, align: "center" },
      { key: "TenMH", header: "Môn học", w: 160, align: "left" },
      { key: "MaLHP", header: "LHP", w: 60, align: "center" },
      { key: "MaHK", header: "Học kỳ", w: 60, align: "center" },
      { key: "SoTC", header: "TC", w: 40, align: "center" },
      { key: "DiemQT", header: "GK", w: 50, align: "center" },
      { key: "DiemCK", header: "CK", w: 50, align: "center" },
      { key: "DiemTK10", header: "Tổng kết", w: 70, align: "center" },
      { key: "KetQua", header: "Kết quả", w: 70, align: "center" },
    ];

    // Nếu tổng width vượt quá tableW thì scale nhẹ
    const sumW = cols.reduce((s, c) => s + c.w, 0);
    if (sumW > tableW) {
      const ratio = tableW / sumW;
      cols.forEach(c => (c.w = Math.floor(c.w * ratio)));
    }

    const headerH = 24;
    const rowH = 20;
    let y = doc.y + 6;

    const drawHeader = () => {
      doc.save();
      doc.fillColor("#0f172a").rect(startX, y, cols.reduce((s, c) => s + c.w, 0), headerH).fill();
      doc.fillColor("#ffffff").fontSize(10);

      let x = startX;
      cols.forEach(c => {
        doc.text(c.header, x + 4, y + 7, { width: c.w - 8, align: c.align });
        x += c.w;
      });

      doc.restore();
      doc.strokeColor("#cbd5e1").lineWidth(1);
      doc.moveTo(startX, y + headerH).lineTo(startX + cols.reduce((s, c) => s + c.w, 0), y + headerH).stroke();
      y += headerH;
    };

    const ensureSpace = (needH) => {
      const bottom = doc.page.height - doc.page.margins.bottom - 18;
      if (y + needH > bottom) {
        doc.addPage({ margin: 28, size: "A4", layout: "landscape" });
        doc.font(fontPath);
        y = doc.page.margins.top;
        drawHeader();
      }
    };

    drawHeader();

    // ===== Rows =====
    doc.fontSize(9).fillColor("#0f172a");

    rows.forEach((r, idx) => {
      ensureSpace(rowH);

      // zebra
      if (idx % 2 === 1) {
        doc.save();
        doc.fillColor("#f1f5f9")
          .rect(startX, y, cols.reduce((s, c) => s + c.w, 0), rowH)
          .fill();
        doc.restore();
      }

      // format điểm
      const rowData = {
        ...r,
        DiemQT: (r.DiemQT == null) ? "" : Number(r.DiemQT).toFixed(1),
        DiemCK: (r.DiemCK == null) ? "" : Number(r.DiemCK).toFixed(1),
        DiemTK10: (r.DiemTK10 == null) ? "" : Number(r.DiemTK10).toFixed(2),
      };

      let x = startX;
      cols.forEach(c => {
        const t = rowData[c.key] == null ? "" : String(rowData[c.key]);
        doc.text(t, x + 4, y + 6, { width: c.w - 8, align: c.align, ellipsis: true });
        x += c.w;
      });

      // line row
      doc.strokeColor("#e2e8f0").lineWidth(0.7);
      doc.moveTo(startX, y + rowH).lineTo(startX + cols.reduce((s, c) => s + c.w, 0), y + rowH).stroke();

      y += rowH;
    });

    // footer
    doc.fontSize(9).fillColor("#64748b");
    doc.text(`Tổng số dòng: ${rows.length}`, startX, doc.page.height - doc.page.margins.bottom - 12);

    doc.end();
  } catch (err) {
    console.error("❌ exportPDF error:", err);
    res.status(500).send("PDF export error");
  }
};


function buildThongKeQuery(query) {
    const { khoa, nganh, monhoc, lhp, hocky, keyword } = query;

    let sql = `
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
            ROUND(bd.DiemTK10,2) AS DiemTK10,
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

    if (khoa)   { sql += " AND k.MaKhoa=?"; params.push(khoa); }
    if (nganh)  { sql += " AND n.MaNganh=?"; params.push(nganh); }
    if (monhoc) { sql += " AND mh.MaMH=?"; params.push(monhoc); }
    if (lhp)    { sql += " AND lhp.MaLHP=?"; params.push(lhp); }
    if (hocky)  { sql += " AND lhp.MaHK=?"; params.push(hocky); }
    if (keyword) {
        sql += " AND (sv.MaSV LIKE ? OR sv.HoTen LIKE ?)";
        params.push(`%${keyword}%`, `%${keyword}%`);
    }

    return { sql, params };
}
