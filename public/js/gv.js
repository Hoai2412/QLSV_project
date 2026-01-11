// public/js/gv.js

// ========================================
//  Helper
// ========================================
async function gvGet(url) {
    const res = await fetch(url);
    return await res.json();
}


// ========================================
//  THÔNG TIN GIẢNG VIÊN
// ========================================
async function loadGVInfo() {
    try {
        const json = await gvGet("/giangvien/api/info");
        if (!json.success) return;

        const info = json.data;

        const headerName = document.getElementById("header-gv-name");
        if (headerName) headerName.innerText = info.HoTen;

        if (document.getElementById("gv-magv")) {
            document.getElementById("gv-magv").innerText = info.MaGV;
            document.getElementById("gv-hoten").innerText = info.HoTen;
            document.getElementById("gv-hocvi").innerText = info.HocVi || "-";
            document.getElementById("gv-bomon").innerText = info.BoMon || "-";
            document.getElementById("gv-email").innerText = info.Email || "-";
            document.getElementById("gv-sodt").innerText = info.SoDT || "-";
        }

        const statsJson = await gvGet("/giangvien/api/dashboard-stats");
        if (statsJson.success) {
            const stats = statsJson.data;
            // Đổ số liệu vào các Card màu sắc trên Dashboard
            document.getElementById("stat-total-lhp").innerText = stats.totalLHP;
            document.getElementById("stat-total-sv").innerText = stats.totalSV;
            document.getElementById("stat-pending-grades").innerText = stats.pendingGrades;
        }

    } catch (err) {
        console.error("Lỗi loadGVInfo:", err);
    }
}


// ========================================
//  LỚP HỌC PHẦN GIẢNG DẠY
// ========================================
async function loadGVLopHocPhan() {
    const table = document.getElementById("gv-lophp-table");
    if (!table) return;

    const filterHK = document.getElementById("filter-hocky");

    let json;
    try {
        json = await gvGet("/giangvien/api/lophocphan");
    } catch (e) {
        console.error("Lỗi fetch /giangvien/api/lophocphan:", e);
        table.innerHTML = `<tr><td colspan="8" style="text-align:center;">Lỗi tải dữ liệu</td></tr>`;
        return;
    }

    table.innerHTML = "";

    // Không đăng nhập / lỗi server / data không phải mảng
    if (!json || !json.success || !Array.isArray(json.data)) {
        const msg = json && json.message ? json.message : "Không có dữ liệu";
        table.innerHTML = `<tr><td colspan="8" style="text-align:center;">${msg}</td></tr>`;
        return;
    }

    let data = json.data;

    // Lọc theo học kỳ
    if (filterHK && filterHK.value !== "") {
        data = data.filter(r => r.MaHK === filterHK.value);
    }

    if (data.length === 0) {
        table.innerHTML = `<tr><td colspan="8" style="text-align:center;">Không có lớp học phần</td></tr>`;
        return;
    }

    data.forEach((r, i) => {
        table.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${r.MaLHP}</td>
                <td>${r.TenMH}</td>
                <td>${r.SoTC}</td>
                <td>${r.MaHK}</td>
                <td>${r.SiSoHienTai}/${r.SiSoToiDa}</td>
                <td>${r.TrangThai}</td>
                <td>
                    <a href="/giangvien/lophocphan/detail?malhp=${r.MaLHP}" class="btn-primary">Xem</a>
                </td>
            </tr>
        `;
    });
}
// ========================================
//  LỊCH THI
// ========================================
// ========================================
//  LỊCH THI – LOAD + FILTER THEO DATA
// ========================================
let _lichThiCache = [];

async function loadGVLichThi() {
    const tbody = document.getElementById("lichthi-table");
    if (!tbody) return;

    const res = await gvGet("/giangvien/api/lichthi");
    tbody.innerHTML = "";

    if (!res.success || !Array.isArray(res.data)) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Không tải được dữ liệu</td></tr>`;
        return;
    }

    _lichThiCache = res.data;

    // 🔥 ĐỔ DROPDOWN THEO DATA
    fillLichThiFilters(_lichThiCache);

    // Render lần đầu
    renderLichThi(_lichThiCache);

    // Gắn sự kiện lọc
    bindLichThiFilter();
}

// ================= RENDER TABLE =================
function renderLichThi(rows) {
    const tbody = document.getElementById("lichthi-table");
    tbody.innerHTML = "";

    if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Không có lịch thi</td></tr>`;
        return;
    }

    rows.forEach((r, i) => {
        const ngay = r.NgayThi
            ? new Date(r.NgayThi).toLocaleDateString("vi-VN")
            : "";

        tbody.innerHTML += `
          <tr>
            <td style="text-align:center;">${i + 1}</td>
            <td>${r.HocKy}</td>
            <td>${r.MonThi}</td>
            <td>${ngay}</td>
            <td>${r.PhongThi}</td>
            <td>${r.CaThi}</td>
            <td>${r.GiamThi}</td>
          </tr>
        `;
    });
}

// ================= ĐỔ DROPDOWN =================
function fillLichThiFilters(data) {
  const selHocKy = document.getElementById("thi-hocky");
  const selCaThi = document.getElementById("thi-cathi");
  if (!selHocKy || !selCaThi) return;

  // 1) Học kỳ: lấy theo data (không hardcode)
  const hocKySet = new Set();
  data.forEach(r => {
    if (r.HocKy) hocKySet.add(r.HocKy);
  });

  selHocKy.innerHTML = `<option value="">-- Tất cả --</option>`;
  [...hocKySet].sort().forEach(hk => {
    selHocKy.innerHTML += `<option value="${hk}">${hk}</option>`;
  });

  // 2) Ca thi: LUÔN CỐ ĐỊNH 4 CA (dù data có hay không)
  const CA_THI_FIXED = ["1-2", "3-5", "6-7", "8-10"];

  selCaThi.innerHTML = `<option value="">-- Tất cả --</option>`;
  CA_THI_FIXED.forEach(ct => {
    selCaThi.innerHTML += `<option value="${ct}">${ct}</option>`;
  });
}

// ================= FILTER =================
function bindLichThiFilter() {
    const btn = document.getElementById("btn-loc-lichthi");
    if (!btn || btn._bound) return;
    btn._bound = true;

    btn.addEventListener("click", () => {
        const hk = document.getElementById("thi-hocky").value;
        const ca = document.getElementById("thi-cathi").value;
        const phong = document.getElementById("thi-phong").value.trim().toLowerCase();

        const filtered = _lichThiCache.filter(r => {
            const okHK = !hk || r.HocKy === hk;
            const okCa = !ca || r.CaThi === ca;
            const okPhong = !phong || String(r.PhongThi || "").toLowerCase().includes(phong);
            return okHK && okCa && okPhong;
        });

        renderLichThi(filtered);
    });
}


// ========================================
//  CHI TIẾT LỚP HỌC PHẦN
// ========================================
// ========================================
//  CHI TIẾT LỚP HỌC PHẦN
// ========================================
async function loadDetailLHP() {
    const url = new URL(window.location.href);
    const MaLHP = url.searchParams.get("malhp");

    // set href cho nút Nhập điểm (nếu có)
    const btnNhap = document.getElementById("btn-nhapdiem");
    if (btnNhap && MaLHP) {
        btnNhap.href = `/giangvien/nhapdiem?malhp=${MaLHP}`;
    }

    if (!MaLHP) return;

    const fields = {
        "detail-malhp": "MaLHP",
        "detail-tenmh": "TenMH",
        "detail-sotc": "SoTC",
        "detail-hocky": "MaHK",
        "detail-gv": "GiangVien",
        "detail-siso": "SiSoHienTai"
    };

    const json = await gvGet("/giangvien/api/lophocphan");
    const lhp = json.data.find(x => x.MaLHP === MaLHP);
    if (!lhp) return;

    // Fill thông tin lớp (dùng được cho cả 2 trang: chi tiết & nhập điểm)
    for (let id in fields) {
        const el = document.getElementById(id);
        if (el) el.innerText = lhp[fields[id]];
    }

    // ==== CHỈ LOAD DANH SÁCH SV NẾU ĐANG Ở TRANG CHI TIẾT LỚP ====
    const tbody = document.getElementById("table-sv-dk");
    if (!tbody) return;   // trang Nhập điểm không có bảng này → dừng tại đây

    // Load danh sách sinh viên cho trang chi tiết lớp
    const svJson = await gvGet(`/giangvien/api/lophocphan/${MaLHP}/sinhvien`);

tbody.innerHTML = "";

if (!svJson.success || svJson.data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Không có sinh viên</td></tr>`;
    return;
}

// Gộp theo MaSV – ưu tiên bản chưa hủy, rồi mới hơn
const uniqueBySV = new Map();

svJson.data.forEach(s => {
    const key = s.MaSV;
    const current = uniqueBySV.get(key);

    if (!current) {
        uniqueBySV.set(key, s);
        return;
    }

    const curHuy = current.TrangThai === "DaHuy";
    const newHuy = s.TrangThai === "DaHuy";

    // ưu tiên bản không bị hủy
    if (curHuy && !newHuy) {
        uniqueBySV.set(key, s);
        return;
    }

    if (curHuy === newHuy) {
        // cùng trạng thái -> lấy bản mới hơn (ID lớn hơn)
        if (s.DangKyID > current.DangKyID) {
            uniqueBySV.set(key, s);
        }
    }
});

const list = [...uniqueBySV.values()];

if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Không có sinh viên</td></tr>`;
    return;
}

list.forEach((s, i) => {
  tbody.innerHTML += `
    <tr>
      <td>${i + 1}</td>
      <td>${s.MaSV}</td>
      <td>${s.HoTen}</td>
      <td>${s.Lop}</td>
      <td>${s.MaNganh}</td>
      <td>${s.TrangThai}</td>
    </tr>
  `;
});

// Đóng hàm loadDetailLHP() ở đây
}


// ========================================
//  LỊCH GIẢNG DẠY
// ========================================
async function loadGVLichDay() {
    const table = document.getElementById("lich-table");
    if (!table) return;

    // 1. Lấy giá trị từ các ô lọc trong HTML
    const filterHK = document.getElementById("lich-hocky") ? document.getElementById("lich-hocky").value : "";
    const filterThu = document.getElementById("lich-thu") ? document.getElementById("lich-thu").value : "";

    try {
        const json = await gvGet("/giangvien/api/lichday");
        
        if (!json.success || !Array.isArray(json.data)) {
            table.innerHTML = `<tr><td colspan="5" style="text-align:center;">Không có dữ liệu lịch dạy</td></tr>`;
            return;
        }

        let data = json.data;

        // 2. Thực hiện lọc dữ liệu ngay tại Client
        if (filterHK !== "") {
            data = data.filter(r => r.MaHK === filterHK);
        }
        if (filterThu !== "") {
            // Lưu ý: filterThu lấy từ value của <select> là String ("2", "3"...), 
            // r.Thu thường là Number nên dùng ép kiểu hoặc ==
            data = data.filter(r => r.Thu == filterThu);
        }

        // 3. Hiển thị kết quả
        table.innerHTML = "";
        if (data.length === 0) {
            table.innerHTML = `<tr><td colspan="5" style="text-align:center;">Không tìm thấy lịch dạy phù hợp</td></tr>`;
            return;
        }

        data.forEach(r => {
            table.innerHTML += `
                <tr>
                    <td>Thứ ${r.Thu}</td>
                    <td>${r.TietBatDau} - ${r.TietKetThuc}</td>
                    <td>${r.MaLHP}</td>
                    <td>${r.TenMH}</td>
                    <td>${r.MaPhong}</td>                
                </tr>
            `;
        });
    } catch (e) {
        console.error("Lỗi fetch lịch dạy:", e);
        table.innerHTML = `<tr><td colspan="5" style="text-align:center;">Lỗi hệ thống</td></tr>`;
    }
}

// ========================================
//  LỊCH HÔM NAY
// ========================================
async function loadTodaySchedule() {
    const tbody = document.getElementById("gv-lichday-today");
    if (!tbody) return;

    const json = await gvGet("/giangvien/api/lichday");

    const dow = new Date().getDay();  // 1 = Thứ 2
    const vnDay = dow === 0 ? 8 : dow + 1;

    const data = json.data.filter(r => r.Thu === vnDay);
    tbody.innerHTML = "";

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Không có lịch hôm nay</td></tr>`;
        return;
    }

    data.forEach(r => {
        tbody.innerHTML += `
            <tr>
                <td>${r.TietBatDau} - ${r.TietKetThuc}</td>
                <td>${r.MaLHP}</td>
                <td>${r.TenMH}</td>
                <td>${r.MaPhong}</td>                
            </tr>
        `;
    });
}
//
async function loadNhatKyPage() {
    const tbody = document.getElementById("nhatky-tbody");
    if (!tbody) return;

    const url = new URL(window.location.href);
    const BangDiemID = url.searchParams.get("bdid");
    const MaSV = url.searchParams.get("masv");
    const HoTen = url.searchParams.get("hoten");
    const MaLHP = url.searchParams.get("malhp");

    // Fill thông tin tra cứu
    document.getElementById("nk-masv").innerText = MaSV || "--";
    document.getElementById("nk-hoten").innerText = HoTen || "--";
    document.getElementById("nk-malhp").innerText = MaLHP || "--";
    document.getElementById("nk-id").innerText = BangDiemID || "--";

    if (!BangDiemID) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Không có ID bảng điểm</td></tr>`;
        return;
    }

    const json = await gvGet(`/giangvien/api/nhatky/${BangDiemID}`);
    tbody.innerHTML = "";

    if (!json.success || json.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Chưa có lịch sử chỉnh sửa</td></tr>`;
        return;
    }

    json.data.forEach(r => {
        tbody.innerHTML += `
            <tr>
                <td>${new Date(r.ThoiGian).toLocaleString("vi-VN")}</td>
                <td>${r.NguoiSua || ""}</td>
                <td>${r.NoiDung || ""}</td>

            </tr>
        `;
    });
}

// =============================
//  QUY ĐỔI ĐIỂM 10 → CHỮ
// =============================
// =============================
//  QUY ĐỔI ĐIỂM 10 → CHỮ + GPA(4) + Kết quả
// =============================
function convert10(tk10) {
  // bạn có thể chỉnh ngưỡng theo quy định trường
  if (tk10 >= 8.5) return { DiemChu: "A",  GPA: 4.0, KetQua: "Đạt" };
  if (tk10 >= 7.0) return { DiemChu: "B",  GPA: 3.0, KetQua: "Đạt" };
  if (tk10 >= 5.5) return { DiemChu: "C",  GPA: 2.0, KetQua: "Đạt" };
  if (tk10 >= 4.0) return { DiemChu: "D",  GPA: 1.0, KetQua: "Đạt" };
  return             { DiemChu: "F",  GPA: 0.0, KetQua: "Rớt" };
}

function recalcRow(tr) {
  const tyleQT = parseFloat(document.getElementById("diem-tyle-qt").value) || 0;
  const tyleCK = parseFloat(document.getElementById("diem-tyle-ck").value) || 0;

  const diemQT = parseFloat(tr.querySelector(".inp-diem-qt").value) || 0;
  const diemCK = parseFloat(tr.querySelector(".inp-diem-ck").value) || 0;

  const tk10 = +(diemQT * tyleQT / 100 + diemCK * tyleCK / 100).toFixed(2);
  const { DiemChu, GPA } = convert10(tk10);

  tr.querySelector(".cell-tk10").innerText = tk10;
  tr.querySelector(".cell-chu").innerText = DiemChu;
  tr.querySelector(".cell-gpa").innerText = GPA.toFixed(2);
}
  
async function loadNhapDiemPage() {
    const tbody = document.getElementById("bangdiem-tbody");
    if (!tbody) return; // không phải trang nhập điểm

    const url = new URL(window.location.href);
    const MaLHP = url.searchParams.get("malhp");
    if (!MaLHP) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">Thiếu tham số malhp</td></tr>`;
        return;
    }

    // Fill thông tin lớp
    await loadDetailLHP();

    // Lấy danh sách SV + điểm nếu có
   // Lấy danh sách SV + điểm nếu có
const svJson = await gvGet(`/giangvien/api/lophocphan/${MaLHP}/sinhvien`);

tbody.innerHTML = "";

if (!svJson.success || !Array.isArray(svJson.data) || svJson.data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">Không có sinh viên</td></tr>`;
    return;
}

// ==== GỘP THEO SINH VIÊN – ƯU TIÊN BẢN CÓ ĐIỂM ====
// key: MaSV → value: record “tốt nhất”
const uniqueBySV = new Map();

svJson.data.forEach(s => {
    const key = s.MaSV;
    const current = uniqueBySV.get(key);

    if (!current) {
        uniqueBySV.set(key, s);
        return;
    }

    const curHasScore = current.DiemTK10 != null;
    const newHasScore = s.DiemTK10 != null;

    // Ưu tiên bản có điểm
    if (!curHasScore && newHasScore) {
        uniqueBySV.set(key, s);
        return;
    }

    if (curHasScore === newHasScore) {
        // Nếu cả hai đều có / đều không có điểm → lấy bản mới hơn
        if (s.DangKyID > current.DangKyID) {
            uniqueBySV.set(key, s);
        }
    }
});

const data = [...uniqueBySV.values()];
if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">Không có sinh viên</td></tr>`;
    return;
}

// Nếu đã có tỷ lệ trong bangdiem (0.40 / 0.60) thì fill sẵn 40 / 60
// Nếu đã có tỷ lệ trong bangdiem (0.40 / 0.60) thì fill sẵn 40 / 60
const first = data[0];
const ipQT = document.getElementById("diem-tyle-qt");
const ipCK = document.getElementById("diem-tyle-ck");

if (first && first.TyLeQT != null && first.TyLeCK != null) {
  if (ipQT) ipQT.value = first.TyLeQT * 100;
  if (ipCK) ipCK.value = first.TyLeCK * 100;
}

// Render bảng
data.forEach((s, i) => {
  const diemQT  = s.DiemQT   != null ? s.DiemQT   : "";
  const diemCK  = s.DiemCK   != null ? s.DiemCK   : "";
  const diemTK  = s.DiemTK10 != null ? s.DiemTK10 : "-";
  const diemChu = s.DiemChu  != null ? s.DiemChu  : "-";
  const gpa = (s.DiemTK10 != null) ? convert10(Number(s.DiemTK10)).GPA.toFixed(2) : "-";

  tbody.innerHTML += `
    <tr data-dangkid="${s.DangKyID}">
      <td>${i + 1}</td>
      <td>${s.MaSV}</td>
      <td>${s.HoTen}</td>
      <td><input type="number" step="0.1" class="inp-diem-qt" value="${diemQT}"></td>
      <td><input type="number" step="0.1" class="inp-diem-ck" value="${diemCK}"></td>
      <td class="cell-tk10">${diemTK}</td>
      <td class="cell-chu">${diemChu}</td>
      <td class="cell-gpa">${gpa}</td>
    </tr>
  `;
});

// Auto recalc sau khi render
const trs = [...tbody.querySelectorAll("tr")];
trs.forEach(tr => {
  const qt = tr.querySelector(".inp-diem-qt");
  const ck = tr.querySelector(".inp-diem-ck");
  if (qt) qt.addEventListener("input", () => recalcRow(tr));
  if (ck) ck.addEventListener("input", () => recalcRow(tr));
  recalcRow(tr);
});

// Khi đổi tỷ lệ -> recalc toàn bộ
const recalcAll = () => trs.forEach(recalcRow);
if (ipQT) ipQT.addEventListener("input", recalcAll);
if (ipCK) ipCK.addEventListener("input", recalcAll);




    // Bắt nút Lưu
    const btnSave = document.getElementById("btn-save-all");
if (!btnSave) return;
    btnSave.onclick = async () => {
  const tyleQT = parseFloat(document.getElementById("diem-tyle-qt").value) || 0;
  const tyleCK = parseFloat(document.getElementById("diem-tyle-ck").value) || 0;

  if (Math.abs((tyleQT + tyleCK) - 100) > 0.001) {
    alert("Tổng tỷ lệ phải = 100%");
    return;
  }

  // gửi về server dạng 0-1
  const TyLeQT = tyleQT / 100;
  const TyLeCK = tyleCK / 100;

  const rows = [...tbody.querySelectorAll("tr")];
  const ds = rows.map(r => {
    const DangKyID = parseInt(r.dataset.dangkid, 10);
    const diemQT = parseFloat(r.querySelector(".inp-diem-qt").value) || 0;
    const diemCK = parseFloat(r.querySelector(".inp-diem-ck").value) || 0;

    const tk10 = +(diemQT * tyleQT / 100 + diemCK * tyleCK / 100).toFixed(2);
    const { DiemChu, GPA, KetQua } = convert10(tk10);

    return {
      DangKyID,
      DiemQT: diemQT,
      DiemCK: diemCK,
      DiemTK10: tk10,
      DiemChu,
      GPA,
      KetQua
    };
  }); // <-- PHẢI đóng map ở đây

  const res = await fetch("/giangvien/api/bangdiem/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ MaLHP, TyLeQT, TyLeCK, ds }) // <-- gửi TyLeQT/TyLeCK đúng
  });

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); }
  catch { json = { success: false, message: text.slice(0, 300) }; }

  if (!res.ok) {
    alert(`HTTP ${res.status}: ${json.message || "Lỗi server"}`);
    return;
  }

  if (json.success) {
    alert("Lưu bảng điểm thành công");
    await loadNhapDiemPage(); // reload để đồng bộ DB
  } else {
    alert(json.message || "Lỗi lưu bảng điểm");
  }
};

}



// ========================================
//  KHỞI ĐỘNG
// ========================================
document.addEventListener("DOMContentLoaded", () => {
    loadGVInfo();
    loadGVLichDay();
    loadGVLichThi();  
    loadGVLopHocPhan();
    loadDetailLHP();
    loadTodaySchedule();
     loadNhapDiemPage(); 
    loadNhatKyPage();

    // Khi chọn học kỳ -> reload bảng
    const hk = document.getElementById("filter-hocky");
    if (hk) {
        hk.addEventListener("change", loadGVLopHocPhan);
    }

    // Đăng xuất (nếu bạn đã dùng API này bên SV)
    const logoutBtn = document.querySelector(".btn-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/";
        });
    }
});
