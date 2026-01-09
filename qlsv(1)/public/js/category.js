// public/js/category.js

function initCategory() {
    console.log("--> Khởi tạo module Quản lý Danh mục (Real Data)");

    // ===== 1. CÁC HÀM HỖ TRỢ (HELPER) =====
    
    // Hàm gọi API lấy dữ liệu (GET)
    async function fetchData(url) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Lỗi tải dữ liệu: ${res.statusText}`);
            return await res.json();
        } catch (err) {
            console.error(err);
            return []; // Trả về mảng rỗng nếu lỗi để không crash web
        }
    }

    // Hàm gọi API gửi dữ liệu (POST, PUT, DELETE)
    async function postData(url, method, data) {
        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối server");
            return { message: "Lỗi kết nối" };
        }
    }

    // Hàm hiển thị thông báo
    function showToast(msg) { alert(msg); }

    // Logic chuyển Tab
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
        });
    });

    // ===== 2. QUAN TRỌNG: LOAD DROPDOWN KHOA TỪ DATABASE =====
    // Hàm này sẽ lấy danh sách Khoa thật và đổ vào 4 ô select trong giao diện
    async function loadDropdowns() {
        // 1. Gọi API lấy danh sách khoa
        const listKhoa = await fetchData('/api/category/khoa');
        
        // 2. Định nghĩa hàm điền dữ liệu vào thẻ select
        const fillSelect = (elementId, placeholder) => {
            const select = document.getElementById(elementId);
            if (!select) return;

            // Reset và thêm option mặc định
            select.innerHTML = `<option value="">${placeholder}</option>`;

            // Duyệt qua danh sách khoa và tạo option
            listKhoa.forEach(k => {
                const opt = document.createElement('option');
                opt.value = k.MaKhoa; // Giá trị gửi lên server
                opt.textContent = k.TenKhoa; // Chữ hiển thị cho người dùng
                select.appendChild(opt);
            });
        };

        // 3. Áp dụng cho các ô select:
        fillSelect('filterKhoaForNganh', '-- Tất cả Khoa --'); // Bộ lọc tab Ngành
        fillSelect('filterKhoaForMon', '-- Lọc theo Khoa --'); // Bộ lọc tab Môn
        fillSelect('selectKhoaInNganh', '-- Chọn Khoa --');    // Modal Thêm Ngành
        fillSelect('selectKhoaInMon', '-- Chọn Khoa --');      // Modal Thêm Môn
    }


    // ===== 3. QUẢN LÝ KHOA =====
    const tbodyKhoa = document.getElementById('tbodyKhoa');
    const modalKhoa = document.getElementById('modalKhoa');
    const formKhoa = document.getElementById('formKhoa');

    async function loadKhoa(search = '') {
        const data = await fetchData(`/api/category/khoa?search=${encodeURIComponent(search)}`);
        tbodyKhoa.innerHTML = '';
        if (data.length === 0) {
            tbodyKhoa.innerHTML = '<tr><td colspan="3" class="text-center">Không tìm thấy dữ liệu</td></tr>';
            return;
        }
        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.MaKhoa}</td>
                <td>${item.TenKhoa}</td>
                <td style="text-align:center">
                    <button class="btn-icon btn-edit-khoa" data-id="${item.MaKhoa}" data-name="${item.TenKhoa}"><i class="fa fa-edit"></i></button>
                    <button class="btn-icon delete btn-del-khoa" data-id="${item.MaKhoa}"><i class="fa fa-trash"></i></button>
                </td>
            `;
            tbodyKhoa.appendChild(tr);
        });
    }

    formKhoa.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('idKhoa').value;
        const ma = document.getElementById('inputMaKhoa').value;
        const ten = document.getElementById('inputTenKhoa').value;

        let res;
        if (id) { 
            res = await postData(`/api/category/khoa/${id}`, 'PUT', { TenKhoa: ten });
        } else { 
            res = await postData(`/api/category/khoa`, 'POST', { MaKhoa: ma, TenKhoa: ten });
        }
        
        if (res.message) {
            showToast(res.message);
            closeModal('modalKhoa');
            loadKhoa();
            loadDropdowns(); // Reload lại dropdown vì danh sách khoa đã thay đổi
        }
    });

    tbodyKhoa.addEventListener('click', async (e) => {
        const btnEdit = e.target.closest('.btn-edit-khoa');
        const btnDel = e.target.closest('.btn-del-khoa');

        if (btnEdit) {
            document.getElementById('idKhoa').value = btnEdit.dataset.id;
            document.getElementById('inputMaKhoa').value = btnEdit.dataset.id;
            document.getElementById('inputMaKhoa').readOnly = true;
            document.getElementById('inputTenKhoa').value = btnEdit.dataset.name;
            document.getElementById('titleKhoa').innerText = 'Cập nhật Khoa';
            modalKhoa.classList.add('show');
        }

        if (btnDel && confirm(`Xóa khoa ${btnDel.dataset.id}?`)) {
            const res = await postData(`/api/category/khoa/${btnDel.dataset.id}`, 'DELETE');
            showToast(res.message);
            loadKhoa();
            loadDropdowns();
        }
    });

    window.openModalKhoa = () => {
        formKhoa.reset();
        document.getElementById('idKhoa').value = '';
        document.getElementById('inputMaKhoa').readOnly = false;
        document.getElementById('titleKhoa').innerText = 'Thêm Khoa Mới';
        modalKhoa.classList.add('show');
    };


    // ===== 4. QUẢN LÝ NGÀNH =====
    const tbodyNganh = document.getElementById('tbodyNganh');
    const modalNganh = document.getElementById('modalNganh');
    const formNganh = document.getElementById('formNganh');

    async function loadNganh(search = '') {
        const maKhoaFilter = document.getElementById('filterKhoaForNganh').value;
        let url = `/api/category/nganh?search=${encodeURIComponent(search)}`;
        if(maKhoaFilter) url += `&maKhoa=${maKhoaFilter}`;

        const data = await fetchData(url);
        tbodyNganh.innerHTML = '';
        if (data.length === 0) {
            tbodyNganh.innerHTML = '<tr><td colspan="4" class="text-center">Không tìm thấy dữ liệu</td></tr>';
            return;
        }
        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.MaNganh}</td>
                <td>${item.TenNganh}</td>
                <td>${item.TenKhoa}</td>
                <td style="text-align:center">
                    <button class="btn-icon btn-edit-nganh" data-obj='${JSON.stringify(item)}'><i class="fa fa-edit"></i></button>
                    <button class="btn-icon delete btn-del-nganh" data-id="${item.MaNganh}"><i class="fa fa-trash"></i></button>
                </td>
            `;
            tbodyNganh.appendChild(tr);
        });
    }

    formNganh.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('idNganh').value;
        const body = {
            MaNganh: document.getElementById('inputMaNganh').value,
            TenNganh: document.getElementById('inputTenNganh').value,
            MaKhoa: document.getElementById('selectKhoaInNganh').value
        };

        if(!body.MaKhoa) { alert("Vui lòng chọn Khoa!"); return; }

        const res = id 
            ? await postData(`/api/category/nganh/${id}`, 'PUT', body)
            : await postData(`/api/category/nganh`, 'POST', body);
        
        showToast(res.message);
        closeModal('modalNganh');
        loadNganh();
    });

    tbodyNganh.addEventListener('click', (e) => {
        const btnEdit = e.target.closest('.btn-edit-nganh');
        const btnDel = e.target.closest('.btn-del-nganh');

        if(btnEdit) {
            const item = JSON.parse(btnEdit.dataset.obj);
            document.getElementById('idNganh').value = item.MaNganh;
            document.getElementById('inputMaNganh').value = item.MaNganh;
            document.getElementById('inputMaNganh').readOnly = true;
            document.getElementById('inputTenNganh').value = item.TenNganh;
            
            // Tự động chọn đúng Khoa trong dropdown
            document.getElementById('selectKhoaInNganh').value = item.MaKhoa;
            
            document.getElementById('titleNganh').innerText = 'Cập nhật Ngành';
            modalNganh.classList.add('show');
        }
        if(btnDel && confirm('Xóa ngành này?')) {
            postData(`/api/category/nganh/${btnDel.dataset.id}`, 'DELETE').then(res => {
                showToast(res.message);
                loadNganh();
            });
        }
    });

    window.openModalNganh = () => {
        formNganh.reset();
        document.getElementById('idNganh').value = '';
        document.getElementById('inputMaNganh').readOnly = false;
        document.getElementById('titleNganh').innerText = 'Thêm Ngành Mới';
        modalNganh.classList.add('show');
    };

    // Khi bộ lọc Khoa thay đổi -> Load lại bảng Ngành
    document.getElementById('filterKhoaForNganh').addEventListener('change', () => loadNganh());


    // ===== 5. QUẢN LÝ MÔN HỌC =====
    const tbodyMon = document.getElementById('tbodyMon');
    const modalMon = document.getElementById('modalMon');
    const formMon = document.getElementById('formMon');

    async function loadMon(search = '') {
        const khoa = document.getElementById('filterKhoaForMon').value;
        const nganh = document.getElementById('filterNganhForMon').value;
        
        let url = `/api/category/mon?search=${encodeURIComponent(search)}`;
        if(khoa) url += `&maKhoa=${khoa}`;
        if(nganh) url += `&maNganh=${nganh}`;

        const data = await fetchData(url);
        tbodyMon.innerHTML = '';
        if (data.length === 0) {
            tbodyMon.innerHTML = '<tr><td colspan="6" class="text-center">Không tìm thấy dữ liệu</td></tr>';
            return;
        }
        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.MaMH}</td>
                <td>${item.TenMH}</td>
                <td>${item.SoTC}</td>
                <td>${item.TenNganh}</td>
                <td>${item.TenKhoa}</td>
                <td style="text-align:center">
                    <button class="btn-icon btn-edit-mon" data-obj='${JSON.stringify(item)}'><i class="fa fa-edit"></i></button>
                    <button class="btn-icon delete btn-del-mon" data-id="${item.MaMH}"><i class="fa fa-trash"></i></button>
                </td>
            `;
            tbodyMon.appendChild(tr);
        });
    }

    // Hàm load Ngành động theo Khoa (cho dropdown)
    window.loadNganhByKhoa = async (maKhoa, targetId) => {
        const target = document.getElementById(targetId);
        target.innerHTML = '<option value="">-- Đang tải... --</option>';
        
        if(!maKhoa) {
            target.innerHTML = '<option value="">-- Vui lòng chọn Khoa trước --</option>';
            return;
        }
        
        const nganhList = await fetchData(`/api/category/nganh?maKhoa=${maKhoa}`);
        target.innerHTML = '<option value="">-- Chọn Ngành --</option>';
        nganhList.forEach(n => {
            const opt = document.createElement('option');
            opt.value = n.MaNganh;
            opt.textContent = n.TenNganh;
            target.appendChild(opt);
        });
    }

    formMon.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('idMon').value;
        const body = {
            MaMH: document.getElementById('inputMaMon').value,
            TenMH: document.getElementById('inputTenMon').value,
            SoTC: document.getElementById('inputSoTC').value,
            MaNganh: document.getElementById('selectNganhInMon').value
        };

        if(!body.MaNganh) { alert("Vui lòng chọn Ngành!"); return; }

        const res = id
            ? await postData(`/api/category/mon/${id}`, 'PUT', body)
            : await postData(`/api/category/mon`, 'POST', body);
        
        showToast(res.message);
        closeModal('modalMon');
        loadMon();
    });

    tbodyMon.addEventListener('click', async (e) => {
        const btnEdit = e.target.closest('.btn-edit-mon');
        const btnDel = e.target.closest('.btn-del-mon');

        if(btnEdit) {
            const item = JSON.parse(btnEdit.dataset.obj);
            
            document.getElementById('idMon').value = item.MaMH;
            document.getElementById('inputMaMon').value = item.MaMH;
            document.getElementById('inputMaMon').readOnly = true;
            document.getElementById('inputTenMon').value = item.TenMH;
            document.getElementById('inputSoTC').value = item.SoTC;
            
            // Set Khoa trước -> Gọi hàm load ngành -> Đợi load xong -> Set Ngành
            document.getElementById('selectKhoaInMon').value = item.MaKhoa;
            await window.loadNganhByKhoa(item.MaKhoa, 'selectNganhInMon'); 
            document.getElementById('selectNganhInMon').value = item.MaNganh;

            document.getElementById('titleMon').innerText = 'Cập nhật Môn Học';
            modalMon.classList.add('show');
        }
        if(btnDel && confirm('Xóa môn học này?')) {
            const res = await postData(`/api/category/mon/${btnDel.dataset.id}`, 'DELETE');
            showToast(res.message);
            loadMon();
        }
    });

    window.openModalMon = () => {
        formMon.reset();
        document.getElementById('idMon').value = '';
        document.getElementById('inputMaMon').readOnly = false;
        document.getElementById('selectNganhInMon').innerHTML = '<option value="">-- Vui lòng chọn Khoa trước --</option>';
        document.getElementById('titleMon').innerText = 'Thêm Môn Học Mới';
        modalMon.classList.add('show');
    };

    // Filter Logic Tab Môn
    document.getElementById('filterKhoaForMon').addEventListener('change', function() {
        window.loadNganhByKhoa(this.value, 'filterNganhForMon');
        loadMon();
    });
    document.getElementById('filterNganhForMon').addEventListener('change', () => loadMon());

    // Các nút tìm kiếm
    window.searchData = (type) => {
        if (type === 'khoa') loadKhoa(document.getElementById('searchKhoa').value);
        if (type === 'nganh') loadNganh(document.getElementById('searchNganh').value);
        if (type === 'mon') loadMon(document.getElementById('searchMon').value);
    }
    
    // Modal Helpers
    window.closeModal = (id) => document.getElementById(id).classList.remove('show');
    window.onclick = (e) => { if(e.target.classList.contains('modal')) e.target.classList.remove('show'); }

    // ===== 6. KHỞI CHẠY LẦN ĐẦU =====
    loadDropdowns(); // Load danh sách khoa vào combobox
    loadKhoa();
    loadNganh();
    loadMon();

    // ===== CHỨC NĂNG RELOAD (MỚI THÊM) =====
    window.reloadData = (type) => {
        if (type === 'khoa') {
            // 1. Xóa ô tìm kiếm
            document.getElementById('searchKhoa').value = '';
            // 2. Tải lại dữ liệu gốc
            loadKhoa();
        }
        else if (type === 'nganh') {
            document.getElementById('searchNganh').value = '';
            // Reset luôn combobox lọc khoa về mặc định
            document.getElementById('filterKhoaForNganh').value = ''; 
            loadNganh();
        }
        else if (type === 'mon') {
            document.getElementById('searchMon').value = '';
            // Reset các bộ lọc
            document.getElementById('filterKhoaForMon').value = '';
            document.getElementById('filterNganhForMon').value = '';
            loadMon();
        }
    }
}

window.initCategory = initCategory;