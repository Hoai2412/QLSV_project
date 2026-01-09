// public/js/nguoidung.js

function initNguoiDung() {
    console.log("--> Init User Management (Update Status)");

    // 1. DOM ELEMENTS
    const pageList = document.getElementById('page-user-list');
    const pageAdd = document.getElementById('page-add-user');
    
    // Buttons
    const btnShowAdd = document.getElementById('btnShowAddUser');
    const btnBack = document.getElementById('btnBackUser');
    const btnSave = document.getElementById('btnSaveUser');
    
    // Filter
    const filterRow = document.querySelector('.filter-row');
    const inputSearch = filterRow ? filterRow.querySelector('input') : null; 
    const selectRoleFilter = filterRow ? filterRow.querySelector('select') : null;
    const btnSearch = filterRow ? filterRow.querySelector('.btn-search') : null;
    const btnRefresh = filterRow ? filterRow.querySelector('.btn-refresh') : null;

    // Form Elements
    const inpRole = document.getElementById('role');
    const inpUsername = document.getElementById('username');
    const inpFullname = document.getElementById('fullname');
    const inpPass = document.getElementById('password');
    const inpRePass = document.getElementById('repassword');
    const titleForm = document.querySelector('#page-add-user .title');

    // Combobox Ngành & Status
    const inpMajor = document.getElementById('major');
    const rowMajor = document.getElementById('row-major');
    
    // --- MỚI: Combobox Trạng thái ---
    const inpStatus = document.getElementById('status');
    const rowStatus = document.getElementById('row-status');

    const tbody = document.querySelector('.table-user tbody');

    let currentMode = 'add'; 
    let editingUsername = null;

    // 2. LOAD DATA
    async function loadMajors() {
        try {
            const res = await fetch('/api/users/majors');
            const majors = await res.json();
            if (inpMajor) {
                inpMajor.innerHTML = '<option value="">-- Chọn ngành --</option>';
                majors.forEach(m => {
                    const opt = document.createElement('option');
                    opt.value = m.MaNganh;
                    opt.textContent = m.TenNganh;
                    inpMajor.appendChild(opt);
                });
            }
        } catch (err) { console.error(err); }
    }

    async function loadUsers() {
        try {
            const search = inputSearch ? inputSearch.value.trim() : '';
            const role = selectRoleFilter ? selectRoleFilter.value : ''; 
            const res = await fetch(`/api/users?search=${encodeURIComponent(search)}&role=${role}`);
            const data = await res.json();
            renderTable(data);
        } catch (err) { console.error(err); }
    }

    function renderTable(data) {
        if (!tbody) return;
        tbody.innerHTML = '';
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Không tìm thấy dữ liệu</td></tr>';
            return;
        }

        const getRoleName = (r) => (r==='Admin'?'Quản trị':(r==='GiangVien'?'Giảng viên':'Sinh viên'));
        const getRoleBadge = (r) => (r==='Admin'?'badge-danger':(r==='GiangVien'?'badge-primary':'badge-success'));

        data.forEach(u => {
            const tr = document.createElement('tr');
            const badgeClass = getRoleBadge(u.VaiTro);
            // Hiển thị trạng thái màu mè chút
            let statusHtml = u.TrangThai === 'Active' 
                ? '<span class="text-success"><i class="fa fa-check-circle"></i> Hoạt động</span>' 
                : '<span class="text-danger"><i class="fa fa-lock"></i> Đã khóa</span>';

            tr.innerHTML = `
                <td><b>${u.Username}</b></td>
                <td>${u.HoTen || '---'}</td>
                <td>${u.Username}</td> 
                <td><span class="badge ${badgeClass}">${getRoleName(u.VaiTro)}</span></td>
                <td>${statusHtml}</td>
                <td>
                    <button class="btn-icon btn-edit" data-id="${u.Username}"><i class="fa fa-edit"></i></button>
                    <button class="btn-icon delete btn-delete" data-id="${u.Username}"><i class="fa fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 3. UI LOGIC
    function toggleMajorInput() {
        if (!rowMajor || !inpRole) return;
        const role = inpRole.value;
        if (role === 'sv' || role === 'gv') {
            rowMajor.style.display = 'flex'; 
            const label = rowMajor.querySelector('label');
            if(label) label.textContent = role === 'sv' ? "Ngành học (SV):" : "Bộ môn (GV):";
        } else {
            rowMajor.style.display = 'none';
        }
    }

    function showForm(mode = 'add') {
        currentMode = mode;
        if (pageList) pageList.style.display = 'none';
        if (pageAdd) pageAdd.style.display = 'block';

        if (mode === 'add') {
            titleForm.innerHTML = '<i class="fa fa-user-plus"></i> THÊM NGƯỜI DÙNG';
            resetForm();
            inpUsername.readOnly = false;
            inpRole.disabled = false;
            inpFullname.readOnly = false; 
            toggleMajorInput();
            
            // Ẩn combobox trạng thái khi thêm mới (mặc định là Active)
            if(rowStatus) rowStatus.style.display = 'none';
        } else {
            titleForm.innerHTML = '<i class="fa fa-user-edit"></i> CẬP NHẬT THÔNG TIN';
            inpUsername.readOnly = true;
            inpRole.disabled = true; 
            inpFullname.readOnly = true;
            inpPass.placeholder = "Để trống nếu không đổi mật khẩu";
            if (rowMajor) rowMajor.style.display = 'none'; 

            // Hiện combobox trạng thái khi sửa
            if(rowStatus) rowStatus.style.display = 'flex';
        }
    }

    function showList() {
        if (pageAdd) pageAdd.style.display = 'none';
        if (pageList) pageList.style.display = 'block';
        resetForm();
    }

    function resetForm() {
        if (inpUsername) inpUsername.value = '';
        if (inpFullname) inpFullname.value = '';
        if (inpRole) inpRole.value = 'sv';
        if (inpPass) inpPass.value = '';
        if (inpRePass) inpRePass.value = '';
        if (inpMajor) inpMajor.value = '';
        if (inpStatus) inpStatus.value = 'Active'; // Reset về Active
        editingUsername = null;
    }

    // 4. CRUD
    // 4.2. Nút Lưu
    if (btnSave) {
        btnSave.addEventListener('click', async () => {
            
            // ============================================================
            // ƯU TIÊN 1: XỬ LÝ IMPORT EXCEL (NẾU CÓ CHỌN FILE)
            // ============================================================
            const fileInput = document.getElementById('fileExcel');
            const txtFileName = document.getElementById('excelFile');

            if (fileInput && fileInput.files.length > 0) {
                // Nếu có file, thực hiện upload ngay lập tức
                const formData = new FormData();
                formData.append('file', fileInput.files[0]);

                try {
                    // Hiển thị loading (nếu muốn)
                    // btnSave.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Đang xử lý...';
                    
                    const res = await fetch('/api/users/import', {
                        method: 'POST',
                        body: formData
                    });
                    const result = await res.json();
                    
                    if (res.ok) {
                        let msg = result.message;
                        // Nếu có danh sách lỗi chi tiết thì log ra console
                        if(result.errors && result.errors.length > 0) {
                            console.warn("Chi tiết lỗi import:", result.errors);
                            msg += `\n(Có ${result.errors.length} dòng lỗi, xem Console để biết chi tiết)`;
                        }
                        alert(msg);

                        // Reset giao diện sau khi import thành công
                        fileInput.value = '';
                        if(txtFileName) txtFileName.value = '';
                        showList();
                        loadUsers();
                    } else {
                        alert("Lỗi Import: " + result.message);
                    }
                } catch (err) {
                    console.error(err);
                    alert("Lỗi kết nối khi upload file");
                } finally {
                    // btnSave.innerHTML = '<i class="fa fa-save"></i> Lưu';
                }

                return; // QUAN TRỌNG: Dừng hàm tại đây, không chạy xuống validation bên dưới
            }


            // ============================================================
            // ƯU TIÊN 2: XỬ LÝ NHẬP TAY (NẾU KHÔNG CÓ FILE EXCEL)
            // ============================================================
            
            // Validation cơ bản (Chỉ chạy khi không chọn file Excel)
            if (!inpUsername.value) { 
                alert("Vui lòng nhập Tên tài khoản (hoặc chọn file Excel để upload)"); 
                return; 
            }
            
            if (currentMode === 'add') {
                if (!inpPass.value) { alert("Vui lòng nhập mật khẩu"); return; }
                if (inpPass.value !== inpRePass.value) { alert("Mật khẩu nhập lại không khớp"); return; }
            } else {
                if (inpPass.value && inpPass.value !== inpRePass.value) {
                    alert("Mật khẩu nhập lại không khớp"); return;
                }
            }

            if (currentMode === 'add' && (inpRole.value === 'sv' || inpRole.value === 'gv')) {
                if (inpMajor && !inpMajor.value) {
                    alert("Vui lòng chọn Ngành/Bộ môn!");
                    return;
                }
            }

            // Gom dữ liệu form
            const payload = {
                Username: inpUsername.value,
                HoTen: inpFullname.value,
                VaiTro: inpRole.value, 
                Password: inpPass.value,
                MaNganh: inpMajor ? inpMajor.value : null,
                TrangThai: currentMode === 'edit' && typeof inpStatus !== 'undefined' ? inpStatus.value : 'Active'
            };

            // Gọi API Thêm/Sửa thủ công
            try {
                let url = '/api/users';
                let method = 'POST';

                if (currentMode === 'edit') {
                    url = `/api/users/${editingUsername}`;
                    method = 'PUT';
                }

                const res = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await res.json();
                
                if (res.ok) {
                    alert(result.message);
                    showList();
                    loadUsers();
                } else {
                    alert("Lỗi: " + result.message);
                }
            } catch (err) {
                console.error(err);
                alert("Lỗi kết nối server");
            }
        });
    }

    // Prepare Edit
    if (tbody) {
        tbody.addEventListener('click', async (e) => {
            const btnEdit = e.target.closest('.btn-edit');
            const btnDel = e.target.closest('.btn-delete');

            if (btnEdit) {
                const username = btnEdit.dataset.id;
                try {
                    const res = await fetch(`/api/users/${username}`);
                    const data = await res.json();

                    editingUsername = data.Username;
                    inpUsername.value = data.Username;
                    inpFullname.value = data.HoTen;
                    
                    if (data.VaiTro === 'SinhVien') inpRole.value = 'sv';
                    else if (data.VaiTro === 'GiangVien') inpRole.value = 'gv';
                    else inpRole.value = 'admin';

                    // --- QUAN TRỌNG: SET GIÁ TRỊ TRẠNG THÁI ---
                    if (inpStatus) {
                        inpStatus.value = data.TrangThai; 
                    }
                    
                    showForm('edit');
                } catch (err) { alert("Lỗi tải thông tin"); }
            }

            if (btnDel) {
                // ... (giữ nguyên logic xóa)
                if (confirm('Xóa user này?')) {
                    fetch(`/api/users/${btnDel.dataset.id}`, {method:'DELETE'})
                        .then(res => res.json())
                        .then(data => { alert(data.message); loadUsers(); });
                }
            }
        });
    }

    // Events
    if (inpRole) inpRole.addEventListener('change', toggleMajorInput);
    if (btnShowAdd) btnShowAdd.addEventListener('click', () => showForm('add'));
    if (btnBack) btnBack.addEventListener('click', showList);
    if (btnSearch) btnSearch.addEventListener('click', loadUsers);
    
    // ================= XỬ LÝ HIỂN THỊ TÊN FILE EXCEL =================
    const inputFile = document.getElementById('fileExcel');
    const txtFileName = document.getElementById('excelFile');

    if (inputFile && txtFileName) {
        inputFile.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                // Lấy tên file
                const fileName = this.files[0].name;
                // Hiển thị lên textbox
                txtFileName.value = fileName;
                // (Tùy chọn) Đổi màu chữ để dễ nhìn
                txtFileName.style.color = '#333';
            } else {
                txtFileName.value = '';
            }
        });
    }

    // ================= 6. KHỞI CHẠY =================   
    // Init
    loadMajors(); 
    loadUsers();
}

window.initNguoiDung = initNguoiDung;