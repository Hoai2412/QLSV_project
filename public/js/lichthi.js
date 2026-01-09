function initLichThi() {
    console.log("--> Init Lich Thi");

    // Pages
    const pageList = document.getElementById("page-lichthi-list");
    const pageForm = document.getElementById("page-lichthi-form");

    // Buttons
    const btnShowAdd = document.getElementById("btnShowAddLT");
    const btnBack = document.getElementById("btnBackLT");
    const btnSave = document.getElementById("btnSaveLT");
    const btnSearch = document.getElementById("btnSearchLT");
    const btnRefresh = document.getElementById("btnRefreshLT");

    // Inputs (SELECT)
    const inpHocKy = document.getElementById("ltHocKy");
    const inpMonThi = document.getElementById("ltMonThi");
    const inpNgayThi = document.getElementById("ltNgayThi");
    const inpCaThi = document.getElementById("ltCaThi");
    const inpPhong = document.getElementById("ltPhong");
    const inpGiamThi = document.getElementById("ltGiamThi");
    


    const titleForm = document.getElementById("ltFormTitle");
    const tbody = document.querySelector(".table-user tbody");

const inpKhoa = document.getElementById("ltKhoa");
const monhocList = document.getElementById("monhocList");

    

    let currentMode = "add";
    let editingId = null;

    // ================= LOAD LIST =================
    async function loadLichThi() {
        const res = await fetch("/api/lichthi");
        const data = await res.json();
        renderTable(data);
    }

    function renderTable(data) {
        tbody.innerHTML = "";

        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="9" class="text-center">
                    Không có dữ liệu
                </td></tr>`;
            return;
        }

        data.forEach(lt => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${lt.ID}</td>
                <td>${lt.HocKy}</td>
                <td>${lt.TenKhoa || ""}</td>
                <td>${lt.MonThi}</td>
                <td>${new Date(lt.NgayThi).toLocaleDateString()}</td>
                <td>${lt.PhongThi}</td>
                <td>${lt.CaThi}</td>
                <td>${lt.GiamThi}</td>
                <td>
                    <button class="btn-icon btn-edit" data-id="${lt.ID}">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" data-id="${lt.ID}">
                        <i class="fa fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // ================= COMBOBOX =================
    async function loadHocKyForm() {
        const res = await fetch("/api/lichthi/hocky/form");
        const data = await res.json();
        inpHocKy.innerHTML = `<option value="">-- Chọn học kỳ --</option>`;
        data.forEach(hk => {
            inpHocKy.innerHTML += `<option value="${hk.MaHK}">${hk.MaHK}</option>`;
        });
    }

    async function loadHocKyFilter() {
    const res = await fetch("/api/lichthi/hocky/all");
    const data = await res.json();

    const filterHocKy = document.getElementById("filterHocKy");
    filterHocKy.innerHTML = `<option value="">Tất cả học kỳ</option>`;

    data.forEach(hk => {
        filterHocKy.innerHTML += `<option value="${hk.MaHK}">${hk.MaHK}</option>`;
    });
}
        
    async function loadPhongThi() {
        const res = await fetch("/api/lichthi/phonghoc/list");
        const data = await res.json();
        inpPhong.innerHTML = `<option value="">-- Chọn phòng --</option>`;
        data.forEach(p => {
            inpPhong.innerHTML += `
                <option value="${p.MaPhong}">
                    ${p.MaPhong} - ${p.TenPhong}
                </option>`;
        });
    }

    async function loadGiamThi() {
        const res = await fetch("/api/lichthi/giamthi/list");
        const data = await res.json();
        inpGiamThi.innerHTML = `<option value="">-- Chọn giám thị --</option>`;
        data.forEach(gv => {
            inpGiamThi.innerHTML += `
                <option value="${gv.MaGV}">
                    ${gv.MaGV} - ${gv.HoTen}
                </option>`;
        });
    }
    async function loadKhoa() {
    const res = await fetch("/api/lichthi/khoa/list");
    const data = await res.json();

    inpKhoa.innerHTML = `<option value="">-- Chọn khoa --</option>`;
    data.forEach(k => {
        inpKhoa.innerHTML += `<option value="${k.MaKhoa}">${k.TenKhoa}</option>`;
    });
}

async function loadMonHocByKhoa(maKhoa, isEdit = false) {
  monhocList.innerHTML = "";

  // chỉ xóa môn khi user đổi khoa (add mode), còn edit thì giữ lại
  if (!isEdit) inpMonThi.value = "";

  if (!maKhoa) return;

  const res = await fetch(`/api/lichthi/monhoc/${maKhoa}`);
  const data = await res.json();

  data.forEach(m => {
    monhocList.innerHTML += `<option value="${m.TenMH}"></option>`;
  });
}


inpKhoa.addEventListener("change", () => {
    loadMonHocByKhoa(inpKhoa.value);
});




    

    // ================= UI =================
    function showForm(mode = "add") {
        currentMode = mode;
        pageList.style.display = "none";
        pageForm.style.display = "block";

        titleForm.innerText =
            mode === "add" ? "THÊM LỊCH THI" : "CẬP NHẬT LỊCH THI";

        resetForm();

        // load combobox
        loadHocKyForm();
        loadPhongThi();
        loadGiamThi();
        loadKhoa();

        // INIT
    

    }
  
    function showList() {
        pageForm.style.display = "none";
        pageList.style.display = "block";
        resetForm();
    }

    function resetForm() {
        inpHocKy.value = "";
        inpMonThi.value = "";
        inpNgayThi.value = "";
        inpCaThi.value = "1-2";
        inpPhong.value = "";
        inpGiamThi.value = "";
        editingId = null;
    }

    // ================= SAVE =================
   btnSave.addEventListener("click", async () => {
    if (!inpHocKy.value || !inpMonThi.value) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    // CHECK TRÙNG TRƯỚC
    const checkRes = await fetch("/api/lichthi/check-trung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            NgayThi: inpNgayThi.value,
            PhongThi: inpPhong.value,
            CaThi: inpCaThi.value,
            id: editingId
        })
    });
    const check = await checkRes.json();

    if (check.trung) {
        alert("❌ Trùng phòng + ca thi trong cùng ngày!");
        return;
    }

    const payload = {
        HocKy: inpHocKy.value,
        MonThi: inpMonThi.value,
        NgayThi: inpNgayThi.value,
        CaThi: inpCaThi.value,
        PhongThi: inpPhong.value,
        GiamThi: inpGiamThi.value
    };

    let url = "/api/lichthi";
    let method = "POST";
    if (currentMode === "edit") {
        url += `/${editingId}`;
        method = "PUT";
    }

    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const result = await res.json();
    alert(result.message);
    showList();
    loadLichThi();
});


    // ================= EDIT / DELETE =================
    tbody.addEventListener("click", async e => {
    const btnEdit = e.target.closest(".btn-edit");
    const btnDelete = e.target.closest(".btn-delete");

    if (btnEdit) {
  const id = btnEdit.dataset.id;
  const res = await fetch(`/api/lichthi/${id}`);
  const data = await res.json();

  editingId = id;
  currentMode = "edit";

  // mở form trước
  pageList.style.display = "none";
  pageForm.style.display = "block";
  titleForm.innerText = "CẬP NHẬT LỊCH THI";

  // load combobox xong rồi mới set value
  await Promise.all([loadHocKyForm(), loadPhongThi(), loadGiamThi(), loadKhoa()]);

  // set đúng dữ liệu gốc
  inpHocKy.value = data.HocKy || "";
  inpNgayThi.value = (data.NgayThi || "").split("T")[0];
  inpCaThi.value = data.CaThi || "1-2";
  inpPhong.value = data.PhongThi || "";
  inpGiamThi.value = data.GiamThi || "";

  // ✅ set khoa gốc (quan trọng nhất)
  inpKhoa.value = data.MaKhoa || "";

  // load danh sách môn theo khoa gốc rồi set môn gốc
  await loadMonHocByKhoa(inpKhoa.value, true);
  inpMonThi.value = data.MonThi || "";
}


    if (btnDelete) {
        if (!confirm("Xóa lịch thi này?")) return;
        await fetch(`/api/lichthi/${btnDelete.dataset.id}`, {
            method: "DELETE"
        });
        loadLichThi();
    }
});


    // ================= EVENTS =================
    btnShowAdd.addEventListener("click", () => showForm("add"));
    btnBack.addEventListener("click", showList);
    btnRefresh.addEventListener("click", loadLichThi);

    btnSearch.addEventListener("click", async () => {
        const keyword = document.getElementById("searchMonThi")?.value || "";
        const hocKy = document.getElementById("filterHocKy")?.value || "";
        const res = await fetch(`/api/lichthi?monThi=${keyword}&hocKy=${hocKy}`);
        const data = await res.json();
        renderTable(data);
    });

    // INIT
    loadLichThi();
    loadHocKyFilter();
}

window.initLichThi = initLichThi;
