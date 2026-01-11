function initLichThi() {
  console.log("--> Init Lich Thi");

  const pageList = document.getElementById("page-lichthi-list");
  const pageForm = document.getElementById("page-lichthi-form");

  const btnShowAdd = document.getElementById("btnShowAddLT");
  const btnBack = document.getElementById("btnBackLT");
  const btnSave = document.getElementById("btnSaveLT");
  const btnSearch = document.getElementById("btnSearchLT");
  const btnRefresh = document.getElementById("btnRefreshLT");

  const inpHocKy = document.getElementById("ltHocKy");
  const inpKhoa = document.getElementById("ltKhoa");
  const inpMaLHP = document.getElementById("ltMaLHP");
  const inpMonThi = document.getElementById("ltMonThi");
  const inpNgayThi = document.getElementById("ltNgayThi");
  const inpCaThi = document.getElementById("ltCaThi");
  const inpPhong = document.getElementById("ltPhong");
  const inpGiamThi = document.getElementById("ltGiamThi");

  const titleForm = document.getElementById("ltFormTitle");
  const tbody = document.querySelector(".table-user tbody");

  let currentMode = "add";
  let editingId = null;

  // cache LHP theo HK+Khoa
  let _lhpCache = [];

  // ================= LOAD LIST =================
  async function loadLichThi() {
    const res = await fetch("/api/lichthi");
    const data = await res.json();
    renderTable(data);
  }

  function renderTable(data) {
    tbody.innerHTML = "";
    if (!data || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="text-center">Không có dữ liệu</td></tr>`;
      return;
    }

    data.forEach(lt => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${lt.ID}</td>
        <td>${lt.HocKy}</td>
        <td>${lt.TenKhoa || ""}</td>
        <td>${lt.MaMH || ""}</td>
        <td>${lt.TenMH || ""}</td>
        <td>${lt.NgayThi ? new Date(lt.NgayThi).toLocaleDateString() : ""}</td>
        <td>${lt.PhongThi || ""}</td>
        <td>${lt.CaThi || ""}</td>
        <td>${lt.GiamThi || ""}</td>
        <td>
          <button class="btn-icon btn-edit" data-id="${lt.ID}"><i class="fa fa-edit"></i></button>
          <button class="btn-icon btn-delete" data-id="${lt.ID}"><i class="fa fa-trash"></i></button>
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
    (data || []).forEach(hk => {
      inpHocKy.innerHTML += `<option value="${hk.MaHK}">${hk.MaHK}</option>`;
    });
  }

  async function loadHocKyFilter() {
    const res = await fetch("/api/lichthi/hocky/all");
    const data = await res.json();
    const filterHocKy = document.getElementById("filterHocKy");
    filterHocKy.innerHTML = `<option value="">Tất cả học kỳ</option>`;
    (data || []).forEach(hk => {
      filterHocKy.innerHTML += `<option value="${hk.MaHK}">${hk.MaHK}</option>`;
    });
  }

  async function loadPhongThi() {
    const res = await fetch("/api/lichthi/phonghoc/list");
    const data = await res.json();
    inpPhong.innerHTML = `<option value="">-- Chọn phòng --</option>`;
    (data || []).forEach(p => {
      inpPhong.innerHTML += `<option value="${p.MaPhong}">${p.MaPhong} - ${p.TenPhong}</option>`;
    });
  }

  async function loadGiamThi() {
    const res = await fetch("/api/lichthi/giamthi/list");
    const data = await res.json();
    inpGiamThi.innerHTML = `<option value="">-- Chọn giám thị --</option>`;
    (data || []).forEach(gv => {
      inpGiamThi.innerHTML += `<option value="${gv.MaGV}">${gv.MaGV} - ${gv.HoTen}</option>`;
    });
  }

  async function loadKhoa() {
    const res = await fetch("/api/lichthi/khoa/list");
    const data = await res.json();
    inpKhoa.innerHTML = `<option value="">-- Chọn khoa --</option>`;
    (data || []).forEach(k => {
      inpKhoa.innerHTML += `<option value="${k.MaKhoa}">${k.TenKhoa}</option>`;
    });
  }

  async function loadMonHocSearchList() {
    const dl = document.getElementById("monhocSearchList");
    if (!dl) return;
    dl.innerHTML = "";

    const khoaRes = await fetch("/api/lichthi/khoa/list");
    const khoaData = await khoaRes.json();

    for (const k of (khoaData || [])) {
      const res = await fetch(`/api/lichthi/monhoc/${k.MaKhoa}`);
      const data = await res.json();
      (data || []).forEach(m => {
        dl.innerHTML += `<option value="${m.TenMH} (${m.MaMH})"></option>`;
        dl.innerHTML += `<option value="${m.MaMH}"></option>`;
      });
    }
  }

  function parseMaMH(monThiText) {
    const m = (monThiText || "").match(/\(([^)]+)\)\s*$/);
    return m ? m[1].trim() : null;
  }

  // ================= LHP (HK + Khoa) =================
  async function loadLHPByHocKyKhoa(selected = "") {
    inpMaLHP.innerHTML = `<option value="">-- Chọn lớp học phần --</option>`;
    inpMonThi.value = "";
    _lhpCache = [];

    const hocKy = inpHocKy.value;
    const maKhoa = inpKhoa.value;
    if (!hocKy || !maKhoa) return;

    const qs = new URLSearchParams({ hocKy, maKhoa });
    const res = await fetch(`/api/lichthi/lophocphan?${qs.toString()}`);
    const data = await res.json();

    if (!Array.isArray(data)) return;

    _lhpCache = data;

    data.forEach(x => {
      inpMaLHP.innerHTML += `<option value="${x.MaLHP}">${x.MaLHP} - ${x.TenMH} (${x.MaMH})</option>`;
    });

    if (selected) inpMaLHP.value = selected;

    const found = _lhpCache.find(x => x.MaLHP === inpMaLHP.value);
    inpMonThi.value = found ? `${found.TenMH} (${found.MaMH})` : "";
  }

  // chọn LHP -> fill môn + check trùng
  inpMaLHP.addEventListener("change", async () => {
    const malhp = inpMaLHP.value;
    const found = _lhpCache.find(x => x.MaLHP === malhp);
    inpMonThi.value = found ? `${found.TenMH} (${found.MaMH})` : "";

    // check nhanh trùng LHP (UX)
    if (currentMode === "add" && malhp) {
      const checkRes = await fetch("/api/lichthi/check-trung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ MaLHP: malhp })
      });
      const check = await checkRes.json();
      if (check.trungLopHocPhan) {
        alert("❌ Lớp học phần này đã có lịch thi!");
        inpMaLHP.value = "";
        inpMonThi.value = "";
      }
    }
  });

  inpHocKy.addEventListener("change", () => loadLHPByHocKyKhoa());
  inpKhoa.addEventListener("change", () => loadLHPByHocKyKhoa());

  // ================= UI =================
  function resetForm() {
    inpHocKy.value = "";
    inpKhoa.value = "";
    inpMaLHP.innerHTML = `<option value="">-- Chọn lớp học phần --</option>`;
    inpMaLHP.value = "";
    inpMonThi.value = "";
    inpNgayThi.value = "";
    inpCaThi.value = "1-2";
    inpPhong.value = "";
    inpGiamThi.value = "";
    editingId = null;
    _lhpCache = [];
  }

  function showForm(mode = "add") {
    currentMode = mode;
    pageList.style.display = "none";
    pageForm.style.display = "block";
    titleForm.innerText = mode === "add" ? "THÊM LỊCH THI" : "CẬP NHẬT LỊCH THI";

    resetForm();
    loadHocKyForm();
    loadPhongThi();
    loadGiamThi();
    loadKhoa();
  }

  function showList() {
    pageForm.style.display = "none";
    pageList.style.display = "block";
    resetForm();
  }

  // ================= SAVE =================
  btnSave.addEventListener("click", async () => {
    if (!inpHocKy.value || !inpMaLHP.value || !inpNgayThi.value || !inpPhong.value || !inpGiamThi.value) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const payload = {
      HocKy: inpHocKy.value,
      MaLHP: inpMaLHP.value,
      NgayThi: inpNgayThi.value,
      CaThi: inpCaThi.value,
      PhongThi: inpPhong.value,
      GiamThi: inpGiamThi.value
    };

    const checkRes = await fetch("/api/lichthi/check-trung", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, id: editingId })
    });
    const check = await checkRes.json();

    if (check.trungPhong) return alert("❌ Trùng phòng + ca thi trong cùng ngày!");
    if (check.trungGiamThi) return alert("❌ Giám thị bị trùng ca trong cùng ngày!");
    if (check.trungLopHocPhan) return alert("❌ Lớp học phần này đã có lịch thi!");

    let url = "/api/lichthi";
    let method = "POST";
    if (currentMode === "edit") { url += `/${editingId}`; method = "PUT"; }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    alert(result.message || "Đã lưu");
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

      pageList.style.display = "none";
      pageForm.style.display = "block";
      titleForm.innerText = "CẬP NHẬT LỊCH THI";

      await Promise.all([loadHocKyForm(), loadPhongThi(), loadGiamThi(), loadKhoa()]);

      inpHocKy.value = data.HocKy || "";
      inpNgayThi.value = (data.NgayThi || "").split("T")[0];
      inpCaThi.value = data.CaThi || "1-2";
      inpPhong.value = data.PhongThi || "";
      inpGiamThi.value = data.GiamThi || "";
      inpKhoa.value = data.MaKhoa || "";

      await loadLHPByHocKyKhoa(data.MaLHP || "");
    }

    if (btnDelete) {
      if (!confirm("Xóa lịch thi này?")) return;
      await fetch(`/api/lichthi/${btnDelete.dataset.id}`, { method: "DELETE" });
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

    const maMH = parseMaMH(keyword);
    const qs = new URLSearchParams();
    if (hocKy) qs.set("hocKy", hocKy);
    if (maMH) qs.set("maMH", maMH);
    else if (keyword) qs.set("monThi", keyword); // ✅ controller đã hỗ trợ monThi

    const res = await fetch(`/api/lichthi?${qs.toString()}`);
    const data = await res.json();
    renderTable(data);
  });

  // INIT
  loadLichThi();
  loadHocKyFilter();
  loadMonHocSearchList();
}

window.initLichThi = initLichThi;
