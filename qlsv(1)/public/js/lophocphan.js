// public/js/lophocphan.js

// Hàm khởi tạo, sẽ được gọi sau khi lophocphan.html đã được load vào #admin-content-lhp
function initLopHocPhan() {

    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return; // HTML chưa load thì thôi

    const searchType = document.getElementById('searchType');
    const btnSearch  = document.getElementById('btnSearch');

    const maLHP   = document.getElementById('maLHP');
    const maMH    = document.getElementById('maMH');
    const maHK    = document.getElementById('maHK');
    const maGV    = document.getElementById('maGV');
    const siSo    = document.getElementById('siSo');
    const maPhong = document.getElementById('maPhong');
    const thu     = document.getElementById('thu');
    const tietBD  = document.getElementById('tietBD');
    const tietKT  = document.getElementById('tietKT');

    const btnAdd    = document.getElementById('btnAdd');
    const btnUpdate = document.getElementById('btnUpdate');
    const btnDelete = document.getElementById('btnDelete');
    const btnReset  = document.getElementById('btnReset');
    const fileExcel = document.getElementById('fileExcel');
    const tableBody = document.getElementById('tableBody');


    let currentSelectedMaLHP = null;

    // ================== TIỆN ÍCH ==================
    function showMessage(msg) {
        alert(msg);
    }

    function resetForm() {
        maLHP.value = '';
        maMH.value = '';
        maHK.value = '';
        maGV.value = '';
        siSo.value = 50;
        maPhong.value = '';
        thu.value = '2';
        tietBD.value = '';
        tietKT.value = '';
        currentSelectedMaLHP = null;
    }

    // ================== LOAD METADATA (COMBOBOX) ==================
    async function loadMetadata() {
        try {
            const res = await fetch('/api/lophocphan/metadata');
            if (!res.ok) throw new Error('Không lấy được metadata');

            const data = await res.json();
            const { monhoc, giangvien, hocky, phonghoc } = data;

            // Môn học
            maMH.innerHTML = '<option value="">-- Chọn môn học --</option>';
            monhoc.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.MaMH;
                opt.textContent = `${m.TenMH} (${m.MaMH})`;
                maMH.appendChild(opt);
            });

            // Học kỳ
            maHK.innerHTML = '<option value="">-- Chọn học kỳ --</option>';
            hocky.forEach(h => {
                const opt = document.createElement('option');
                opt.value = h.MaHK;
                opt.textContent = `${h.MaHK} - ${h.TenHK}`;
                maHK.appendChild(opt);
            });

            // Giảng viên
            maGV.innerHTML = '<option value="">-- Chưa phân công --</option>';
            giangvien.forEach(g => {
                const opt = document.createElement('option');
                opt.value = g.MaGV;
                opt.textContent = `${g.HoTen} (${g.MaGV})`;
                maGV.appendChild(opt);
            });

            // Phòng học
            maPhong.innerHTML = '<option value="">-- Chọn phòng --</option>';
            phonghoc.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.MaPhong;
                opt.textContent = `${p.TenPhong} (${p.MaPhong})`;
                maPhong.appendChild(opt);
            });
        } catch (err) {
            console.error(err);
            showMessage('Lỗi tải dữ liệu danh mục (môn học, giảng viên, phòng học, học kỳ)');
        }
    }

    // ================== LOAD DANH SÁCH LỚP HỌC PHẦN ==================
    async function loadLHP(search = '', type = '') {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (type) params.append('type', type);

            const res = await fetch('/api/lophocphan' + (params.toString() ? ('?' + params.toString()) : ''));
            if (!res.ok) throw new Error('Không tải được danh sách lớp');

            const list = await res.json();

            tableBody.innerHTML = '';

            if (!list || list.length === 0) {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 7;
                td.textContent = 'Không có dữ liệu';
                tr.appendChild(td);
                tableBody.appendChild(tr);
                return;
            }

            list.forEach(row => {
                const tr = document.createElement('tr');
                tr.classList.add('lhp-row');

                // Lưu data lên attribute để khi click có thể đổ lên form
                tr.dataset.malhp   = row.MaLHP;
                tr.dataset.mamh    = row.MaMH;
                tr.dataset.mahk    = row.MaHK;
                tr.dataset.magv    = row.MaGV || '';
                tr.dataset.siso    = row.SiSoToiDa;
                tr.dataset.maphong = row.MaPhong || '';
                tr.dataset.thu     = row.Thu || '';
                tr.dataset.tietbd  = row.TietBatDau || '';
                tr.dataset.tietkt  = row.TietKetThuc || '';

                const lichHocText = row.Thu
                    ? `Thứ ${row.Thu}, tiết ${row.TietBatDau}-${row.TietKetThuc}`
                    : 'Chưa xếp lịch';

                tr.innerHTML = `
                    <td>${row.MaLHP}</td>
                    <td>${row.TenMH}</td>
                    <td>${row.MaHK}</td>
                    <td>${row.TenGV || ''}</td>
                    <td>${row.TenPhong || row.MaPhong || ''}</td>
                    <td>Thứ ${row.Thu}, Tiết ${row.TietBatDau}-${row.TietKetThuc}</td>
                    <td>${row.SiSoHienTai}/${row.SiSoToiDa}</td>
                `;

                // Khi click một dòng -> đổ dữ liệu lên form để sửa
                tr.addEventListener('click', () => {
                    document.querySelectorAll('.lhp-row').forEach(r => r.classList.remove('selected'));
                    tr.classList.add('selected');

                    currentSelectedMaLHP = row.MaLHP;

                    maLHP.value   = row.MaLHP;
                    maMH.value    = row.MaMH;
                    maHK.value    = row.MaHK;
                    maGV.value    = row.MaGV || '';
                    siSo.value    = row.SiSoToiDa;
                    maPhong.value = row.MaPhong || '';
                    thu.value     = row.Thu;
                    tietBD.value  = row.TietBatDau;
                    tietKT.value  = row.TietKetThuc;
                });

                tableBody.appendChild(tr);
            });
        } catch (err) {
            console.error(err);
            showMessage('Lỗi tải danh sách lớp học phần');
        }
    }

    // ================== THÊM MỚI ==================
    async function handleAdd() {
        try {
            const body = {
                MaLHP: maLHP.value.trim(),
                MaMH: maMH.value,
                MaHK: maHK.value,
                MaGV: maGV.value || null,
                SiSoToiDa: siSo.value ? parseInt(siSo.value, 10) : 50,
                MaPhong: maPhong.value || null,
                Thu: thu.value || null,
                TietBD: tietBD.value ? parseInt(tietBD.value, 10) : null,
                TietKT: tietKT.value ? parseInt(tietKT.value, 10) : null
            };

            if (!body.MaLHP || !body.MaMH || !body.MaHK) {
                showMessage('Vui lòng nhập Mã lớp, chọn Môn học và Học kỳ!');
                return;
            }

            const res = await fetch('/api/lophocphan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (!res.ok) {
                showMessage(data.message || 'Thêm lớp học phần thất bại');
                return;
            }

            showMessage(data.message || 'Thêm lớp học phần thành công');
            await loadLHP();
            resetForm();
        } catch (err) {
            console.error(err);
            showMessage('Lỗi hệ thống khi thêm lớp học phần');
        }
    }

    // ================== CẬP NHẬT ==================
    async function handleUpdate() {
        if (!currentSelectedMaLHP) {
            showMessage('Hãy chọn một lớp học phần cần sửa trong bảng.');
            return;
        }

        try {
            const body = {
                MaLHP: currentSelectedMaLHP,   // khóa chính không đổi
                MaMH: maMH.value,
                MaHK: maHK.value,
                MaGV: maGV.value || null,
                SiSoToiDa: siSo.value ? parseInt(siSo.value, 10) : 50,
                MaPhong: maPhong.value || null,
                Thu: thu.value || null,
                TietBD: tietBD.value ? parseInt(tietBD.value, 10) : null,
                TietKT: tietKT.value ? parseInt(tietKT.value, 10) : null
            };

            const res = await fetch('/api/lophocphan', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (!res.ok) {
                showMessage(data.message || 'Cập nhật lớp học phần thất bại');
                return;
            }

            showMessage(data.message || 'Cập nhật thành công');
            await loadLHP(searchInput.value.trim(), searchType.value);
        } catch (err) {
            console.error(err);
            showMessage('Lỗi hệ thống khi cập nhật lớp học phần');
        }
    }

    // ================== XÓA ==================
    async function handleDelete() {
        if (!currentSelectedMaLHP) {
            showMessage('Hãy chọn một lớp học phần cần xóa trong bảng.');
            return;
        }

        if (!confirm(`Bạn có chắc muốn xóa lớp học phần ${currentSelectedMaLHP}?`)) return;

        try {
            const res = await fetch(`/api/lophocphan/${encodeURIComponent(currentSelectedMaLHP)}`, {
                method: 'DELETE'
            });

            const data = await res.json();
            if (!res.ok) {
                showMessage(data.message || 'Xóa lớp học phần thất bại');
                return;
            }

            showMessage(data.message || 'Đã xóa lớp học phần');
            await loadLHP(searchInput.value.trim(), searchType.value);
            resetForm();
        } catch (err) {
            console.error(err);
            showMessage('Lỗi hệ thống khi xóa lớp học phần');
        }
    }

    // ================== TÌM KIẾM ==================
    function handleSearch() {
        const keyword = searchInput.value.trim();
        const type = searchType.value;
        loadLHP(keyword, type);
    }

    // ================== IMPORT EXCEL ==================
    async function handleImportExcel(e) {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/lophocphan/import', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (!res.ok) {
                showMessage(data.message || 'Nhập Excel thất bại');
                return;
            }

            let msg = data.message || 'Nhập Excel thành công';
            if (data.errors && data.errors.length > 0) {
                msg += '\nMột số lỗi:\n- ' + data.errors.join('\n- ');
            }
            showMessage(msg);

            await loadLHP();
            fileExcel.value = ''; // reset input
        } catch (err) {
            console.error(err);
            showMessage('Lỗi server khi xử lý file Excel');
        }
    }

    // ================== GẮN SỰ KIỆN ==================
    btnSearch.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    btnAdd.addEventListener('click', handleAdd);
    btnUpdate.addEventListener('click', handleUpdate);
    btnDelete.addEventListener('click', handleDelete);
    btnReset.addEventListener('click', () => {
        resetForm();
        loadLHP();
    });

    fileExcel.addEventListener('change', handleImportExcel);

    // ================== KHỞI TẠO BAN ĐẦU ==================
    loadMetadata();
    loadLHP();
    resetForm();
}

// Để admin.js có thể gọi sau khi load lophocphan.html xong
window.initLopHocPhan = initLopHocPhan;

// Nếu vì lý do nào đó lophocphan.html đã có sẵn trên trang khi load,
// ta thử init ngay sau DOMContentLoaded

