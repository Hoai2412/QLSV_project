// public/js/lichthi.js

let selectedID = null;

// ================= INIT =================
function initLichThi() {
    const table = document.getElementById("lichthi-data");
    if (!table) return; // HTML chưa load xong

    // ✅ Load dữ liệu ban đầu
    loadKhoa();
    loadGiamThi();
    loadLichThi();

    // ✅ Gắn sự kiện nút (AN TOÀN)
    const btnAdd = document.getElementById("btnAdd");
    const btnUpdate = document.getElementById("btnUpdate");
    const btnDelete = document.getElementById("btnDelete");

    if (btnAdd && !btnAdd.dataset.bound) {
        btnAdd.addEventListener("click", addLichThi);
        btnAdd.dataset.bound = "true";
    }

    if (btnUpdate && !btnUpdate.dataset.bound) {
        btnUpdate.addEventListener("click", updateLichThi);
        btnUpdate.dataset.bound = "true";
    }

    if (btnDelete && !btnDelete.dataset.bound) {
        btnDelete.addEventListener("click", deleteLichThi);
        btnDelete.dataset.bound = "true";
    }
}

// ================= LOAD KHOA =================
function loadKhoa() {
    fetch("/api/lichthi/khoa")
        .then(res => res.json())
        .then(data => {
            let html = `<option value="">-- Chọn khoa --</option>`;
            data.forEach(k => {
                html += `<option value="${k.TenKhoa}">${k.TenKhoa}</option>`;
            });
            document.getElementById("khoa").innerHTML = html;
        });
}

// ================= LOAD GIÁM THỊ =================
function loadGiamThi() {
    fetch("/api/lichthi/giamthi")
        .then(res => res.json())
        .then(data => {
            let html = `<option value="">-- Chọn giám thị --</option>`;
            data.forEach(g => {
                html += `<option value="${g.MaGV}">${g.MaGV} - ${g.HoTen}</option>`;
            });
            document.getElementById("giamthi").innerHTML = html;
        });
}

// ================= LOAD LỊCH THI =================
function loadLichThi() {
    fetch("/api/lichthi")
        .then(res => res.json())
        .then(data => {
            const body = document.getElementById("lichthi-data");
            body.innerHTML = "";

            data.forEach(row => {
                body.innerHTML += `
                    <tr onclick="selectRow(this)"
                        data-id="${row.ID}"
                        data-hk="${row.HocKy}"
                        data-mon="${row.MonThi}"
                        data-ngay="${row.NgayThi}"
                        data-phong="${row.PhongThi}"
                        data-ca="${row.CaThi}"
                        data-gt="${row.GiamThi}"
                    >
                        <td>${row.ID}</td>
                        <td>${row.HocKy}</td>
                        <td>${row.MonThi}</td>
                        <td>${row.NgayThi}</td>
                        <td>${row.PhongThi}</td>
                        <td>${row.CaThi}</td>
                        <td>${row.GiamThi}</td>
                    </tr>
                `;
            });
        });
}

// ================= CHỌN DÒNG =================
function selectRow(tr) {
    selectedID = tr.dataset.id;

    document.getElementById("hocky").value = tr.dataset.hk;
    document.getElementById("monthi").value = tr.dataset.mon;
    document.getElementById("ngaythi").value = tr.dataset.ngay;
    document.getElementById("phongthi").value = tr.dataset.phong;
    document.getElementById("cathi").value = tr.dataset.ca;
    document.getElementById("giamthi").value = tr.dataset.gt;
}

// ================= THÊM =================
function addLichThi() {
    const obj = getFormData();

    fetch("/api/lichthi/add", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(obj)
    })
    .then(res => res.json())
    .then(() => loadLichThi());
}

// ================= SỬA =================
function updateLichThi() {
    if (!selectedID) return alert("Chọn dòng cần sửa!");

    const obj = getFormData();

    fetch(`/api/lichthi/update/${selectedID}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(obj)
    })
    .then(res => res.json())
    .then(() => loadLichThi());
}

// ================= XOÁ =================
function deleteLichThi() {
    if (!selectedID) return alert("Chọn dòng cần xóa!");
    if (!confirm("Bạn có chắc muốn xóa?")) return;

    fetch(`/api/lichthi/delete/${selectedID}`, { method: "DELETE" })
        .then(res => res.json())
        .then(() => {
            selectedID = null;
            loadLichThi();
        });
}

// ================= HELPER =================
function getFormData() {
    return {
        HocKy: document.getElementById("hocky").value,
        MonThi: document.getElementById("monthi").value,
        NgayThi: document.getElementById("ngaythi").value,
        PhongThi: document.getElementById("phongthi").value,
        CaThi: document.getElementById("cathi").value,
        GiamThi: document.getElementById("giamthi").value
    };
}

// ================= EXPORT =================
window.initLichThi = initLichThi;
