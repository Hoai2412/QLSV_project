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
//  CHI TIẾT LỚP HỌC PHẦN
// ========================================
async function loadDetailLHP() {
    const url = new URL(window.location.href);
    const MaLHP = url.searchParams.get("malhp");
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

    for (let id in fields) {
        document.getElementById(id).innerText = lhp[fields[id]];
    }

    // Load danh sách sinh viên
    const svJson = await gvGet(`/giangvien/api/lophocphan/${MaLHP}/sinhvien`);
    const tbody = document.getElementById("table-sv-dk");

    tbody.innerHTML = "";

    if (!svJson.success || svJson.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Không có sinh viên</td></tr>`;
        return;
    }

    svJson.data.forEach((s, i) => {
        tbody.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${s.MaSV}</td>
                <td>${s.HoTen}</td>
                <td>${s.Lop}</td>
                <td>${s.MaNganh}</td>
                <td>${s.TrangThai}</td>
                <td>✔</td>
            </tr>
        `;
    });
}


// ========================================
//  LỊCH GIẢNG DẠY
// ========================================
async function loadGVLichDay() {
    const table = document.getElementById("lich-table");
    if (!table) return;

    const json = await gvGet("/giangvien/api/lichday");
    table.innerHTML = "";

    if (!json.success || json.data.length === 0) {
        table.innerHTML = `<tr><td colspan="6" style="text-align:center;">Không có dữ liệu</td></tr>`;
        return;
    }

    json.data.forEach(r => {
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


// ========================================
//  KHỞI ĐỘNG
// ========================================
document.addEventListener("DOMContentLoaded", () => {
    loadGVInfo();
    loadGVLichDay();
    loadGVLopHocPhan();
    loadDetailLHP();
    loadTodaySchedule();

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
