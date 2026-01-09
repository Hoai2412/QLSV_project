// public/js/dangkylhp.js

let currentEditId = null; // Biến lưu ID đang sửa

// ================= INIT =================
function initDangKyLHP() {
    const table = document.getElementById('tableDotDKHP');
    if (!table) return; // HTML chưa load xong → thoát an toàn

    // Load danh sách lần đầu
    loadDotDKHP();

    // Gắn sự kiện form
    const form = document.getElementById('formAddDot');
    if (form && !form.dataset.bound) {
        form.addEventListener('submit', handleSubmitDot);
        form.dataset.bound = "true";
    }
}

// ================= LOAD DỮ LIỆU =================

async function loadDotDKHP(keyword = '', type = 'tendot') {
    try {
        const res = await fetch(`/api/dangkylhp?keyword=${encodeURIComponent(keyword)}&type=${type}`);
        const data = await res.json();
        const tbody = document.getElementById('tableDotDKHP');
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">Không tìm thấy dữ liệu</td></tr>';
            return;
        }

        data.forEach((item, index) => {
            const now = new Date();
            const start = new Date(item.NgayBatDau);
            const end = new Date(item.NgayKetThuc);

            let statusText = 'Đã đóng';
            let statusClass = 'status-closed';

            if (now < start) {
                statusText = 'Sắp mở';
                statusClass = 'status-future';
            } else if (now >= start && now <= end) {
                statusText = 'Đang mở';
                statusClass = 'status-open';
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td style="font-weight:bold; color:#0056b3;">${item.TenDot}</td>
                <td>${item.TenNamHoc}</td>
                <td>${item.TenHK}</td>
                <td>${formatDate(item.NgayBatDau)}</td>
                <td>${formatDate(item.NgayKetThuc)}</td>
                <td>${item.HanMucTinChi}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn-icon" onclick="openEditModal(${item.ID})"><i class="fa fa-edit"></i></button>
                    <button class="btn-icon delete" onclick="deleteDot(${item.ID})"><i class="fa fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
    }
}

// ================= SUBMIT =================

async function handleSubmitDot(e) {
    e.preventDefault();

    const payload = {
        tenDot: document.getElementById('tenDot').value,
        namHoc: document.getElementById('txtNamHoc').value.trim(),
        tenHK: document.getElementById('slHocKy').value,
        ngayBD: document.getElementById('ngayBD').value,
        ngayKT: document.getElementById('ngayKT').value,
        tinChi: document.getElementById('tinChi').value
    };

    let url = '/api/dangkylhp';
    let method = 'POST';

    if (currentEditId) {
        url = `/api/dangkylhp/${currentEditId}`;
        method = 'PUT';
    }

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (res.ok) {
            alert(result.message);
            closeModal();
            loadDotDKHP();
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (err) {
        alert("Lỗi kết nối server");
    }
}

// ================= CÁC HÀM CŨ (GIỮ NGUYÊN) =================
// Hàm Xử lý khi bấm nút Sửa (Load data lên form)
async function openEditModal(id) {
    try {
        const res = await fetch(`/api/dangkylhp/${id}`);
        if (!res.ok) throw new Error("Lỗi tải dữ liệu");
        const data = await res.json();

        // Đổ dữ liệu vào form
        document.getElementById('tenDot').value = data.TenDot;
        
        // Xử lý chuỗi năm học (VD: "Năm học 2024 - 2025" -> "2024 - 2025")
        let namHocText = data.TenNamHoc.replace("Năm học ", "").trim();
        document.getElementById('txtNamHoc').value = namHocText;
        
        document.getElementById('slHocKy').value = data.TenHK; 
        document.getElementById('ngayBD').value = convertToDateTimeLocal(data.NgayBatDau);
        document.getElementById('ngayKT').value = convertToDateTimeLocal(data.NgayKetThuc);
        document.getElementById('tinChi').value = data.HanMucTinChi;

        // Cập nhật giao diện Modal thành "Sửa"
        currentEditId = id; 
        document.querySelector('.modal-header h3').innerHTML = '<i class="fa fa-edit"></i> Cập nhật đợt đăng ký';
        
        openModal(); 

    } catch (err) {
        alert(err.message);
    }
}
// Hàm Xử lý khi bấm nút Xóa
async function deleteDot(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa đợt đăng ký này? Dữ liệu không thể phục hồi.")) {
        return;
    }

    try {
        const res = await fetch(`/api/dangkylhp/${id}`, { method: 'DELETE' });
        const result = await res.json();
        
        if (res.ok) {
            alert(result.message);
            loadDotDKHP(); // Refresh lại bảng
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (err) {
        alert("Lỗi kết nối server");
    }
}

function searchDotDKHP() {
    const keyword = document.getElementById('keyword').value;
    const type = document.getElementById('filterType').value;
    loadDotDKHP(keyword, type);
}

function refreshDotDKHP() {
    document.getElementById('keyword').value = '';
    loadDotDKHP();
}

function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleString('vi-VN');
}

function convertToDateTimeLocal(dateString) {
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000; 
    const localISOTime = (new Date(date - offset)).toISOString().slice(0, 16);
    return localISOTime;
}

function openModal() {
    document.getElementById('modalAddDot').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modalAddDot').style.display = 'none';
    document.getElementById('formAddDot').reset();
    
    // Reset về trạng thái Thêm mới
    currentEditId = null; 
    document.querySelector('.modal-header h3').innerHTML = '<i class="fa fa-plus"></i> Thêm mới đợt đăng ký';
    document.getElementById('tinChi').value = 20;
}

window.onclick = function(event) {
    const modal = document.getElementById('modalAddDot');
    if (event.target == modal) {
        closeModal();
    }
}