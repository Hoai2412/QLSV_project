document.addEventListener("DOMContentLoaded", () => {
    loadDiem();

    document.querySelector(".btn-search").addEventListener("click", searchDiem);
    document.querySelector(".btn-lock").addEventListener("click", lockAll);
    document.querySelector(".btn-unlock").addEventListener("click", unlockAll);
});

// ================= LOAD ĐIỂM =================
function loadDiem() {
    fetch("/api/diem")
        .then(res => res.json())
        .then(data => renderTable(data))
        .catch(err => console.error("Lỗi load điểm:", err));
}

// ================= HIỂN THỊ BẢNG =================
function renderTable(data) {
    const tbody = document.getElementById("score-data");
    tbody.innerHTML = "";

    data.forEach(d => {
        tbody.innerHTML += `
            <tr>
                <td>${d.tenLopHP}</td>
                <td>${d.MaSV}</td>
                <td>${d.HoTen}</td>
                <td>${d.tenMH}</td>
                <td>${d.DiemQT}</td>
                <td>${d.DiemCK}</td>
                <td>${d.DiemTK10}</td>
                <td>${d.DiemChu}</td>
                <td>${d.KetQua}</td>
            </tr>
        `;
    });
}

// ================= TÌM KIẾM =================
function searchDiem() {
    const type = document.getElementById("typeSearch").value;
    const key = document.getElementById("txtSearch").value;

    fetch(`/api/diem/search?type=${type}&key=${key}`)
        .then(res => res.json())
        .then(data => renderTable(data));
}

// ================= KHOÁ TOÀN BỘ =================
function lockAll() {
    fetch("/api/diem/lockall", { method: "POST" })
        .then(() => loadDiem())
        .then(() => alert("Đã khoá sổ điểm"));
}

// ================= MỞ KHOÁ TOÀN BỘ =================
function unlockAll() {
    fetch("/api/diem/unlockall", { method: "POST" })
        .then(() => loadDiem())
        .then(() => alert("Đã mở khoá sổ điểm"));
}
// ================= INIT =================
function initDiem() {
    const table = document.getElementById("score-data");
    if (!table) return; // HTML chưa load → thoát an toàn

    loadDiem();

    const btnSearch = document.querySelector(".btn-search");
    const btnLock = document.querySelector(".btn-lock");
    const btnUnlock = document.querySelector(".btn-unlock");

    if (btnSearch && !btnSearch.dataset.bound) {
        btnSearch.addEventListener("click", searchDiem);
        btnSearch.dataset.bound = "true";
    }

    if (btnLock && !btnLock.dataset.bound) {
        btnLock.addEventListener("click", lockAll);
        btnLock.dataset.bound = "true";
    }

    if (btnUnlock && !btnUnlock.dataset.bound) {
        btnUnlock.addEventListener("click", unlockAll);
        btnUnlock.dataset.bound = "true";
    }
}
