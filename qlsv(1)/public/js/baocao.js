// ================= KHỞI TẠO =================
function initBaoCao() {
    console.log("✅ initBaoCao chạy");

    window.filterKhoa  = document.getElementById("filterKhoa");
    window.filterNganh = document.getElementById("filterNganh");
    window.filterMon   = document.getElementById("filterMon");
    window.filterLHP   = document.getElementById("filterLHP");
    window.filterHK    = document.getElementById("filterHK");
    window.searchInput = document.getElementById("searchInput");

    // LOAD COMBOBOX
    loadFilters();

    // LOAD LẦN ĐẦU
    loadThongKe();

    // CLICK TỔNG HỢP

    // SEARCH REALTIME
    searchInput.addEventListener("input", debounce(loadThongKe, 400));

    // THAY ĐỔI COMBOBOX → LOAD LẠI
    [filterKhoa, filterNganh, filterMon, filterLHP, filterHK]
        .forEach(select => select.addEventListener("change", loadThongKe));
}


// ================= LOAD COMBOBOX =================
function loadFilters() {
    fetch("/api/baocao/filters")
        .then(res => res.json())
        .then(data => {
            renderSelect(filterKhoa,  data.khoa,  "MaKhoa",  "TenKhoa");
            renderSelect(filterNganh, data.nganh, "MaNganh", "TenNganh");
            renderSelect(filterMon,   data.monhoc,"MaMH",   "TenMH");
            renderSelect(filterLHP,   data.lhp,   "MaLHP",  "MaLHP");
            renderSelect(filterHK,    data.hocky, "MaHK",   "MaHK");
        });
}

function renderSelect(select, data, valueKey, textKey) {
    select.innerHTML = `<option value="">Tất cả</option>`;
    if (!Array.isArray(data)) return;

    data.forEach(item => {
        select.innerHTML += `
            <option value="${item[valueKey]}">
                ${item[textKey]}
            </option>`;
    });
}


// ================= LOAD THỐNG KÊ =================
function loadThongKe() {
    const params = new URLSearchParams({
        khoa:   filterKhoa.value,
        nganh:  filterNganh.value,
        monhoc: filterMon.value,
        lhp:    filterLHP.value,
        hocky:  filterHK.value,
        keyword: searchInput.value
    });

    fetch(`/api/baocao/thongke?${params}`)
        .then(res => res.json())
        .then(renderTable);
}


// ================= RENDER TABLE =================
function renderTable(data) {
    const tbody = document.getElementById("baocao-data");
    tbody.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="12" style="text-align:center; color:#888">
                    Không có dữ liệu
                </td>
            </tr>`;
        return;
    }

    data.forEach(r => {
        const tongKet = Number(r.TongKet).toFixed(2);
        const ketQua  = tongKet >= 4 ? "Đạt" : "Không đạt";

        tbody.innerHTML += `
            <tr>
                <td>${r.MSSV}</td>     <!-- ✅ SỬA TẠI ĐÂY -->
                <td>${r.HoTen}</td>
                <td>${r.Khoa}</td>
                <td>${r.Nganh}</td>
                <td>${r.MonHoc}</td>
                <td>${r.LopHP}</td>
                <td>${r.HocKy}</td>
                <td>${r.TinChi}</td>
                <td>${r.GK}</td>
                <td>${r.CK}</td>
                <td>${tongKet}</td>
                <td>${ketQua}</td>
            </tr>`;
    });
}


// ================= TIỆN ÍCH =================
function debounce(fn, delay) {
    let timer;
    return () => {
        clearTimeout(timer);
        timer = setTimeout(fn, delay);
    };
}

function buildQueryParams() {
    return new URLSearchParams({
        khoa: filterKhoa.value,
        nganh: filterNganh.value,
        monhoc: filterMon.value,
        lhp: filterLHP.value,
        hocky: filterHK.value,
        keyword: searchInput.value
    }).toString();
}

function xuatExcel() {
    const params = buildQueryParams();
    window.open(`/api/baocao/export-excel?${params}`, "_blank");
}

function xuatPDF() {
    const params = buildQueryParams();
    window.open(`/api/baocao/export-pdf?${params}`, "_blank");
}

