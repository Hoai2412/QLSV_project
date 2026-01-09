// public/js/app.js
// ====== Helper ======
async function apiGet(url) {
    const res = await fetch(url);
    return await res.json();
}

async function apiPost(url, data) {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return await res.json();
}

// ======================================================================
// 1. THÔNG TIN SINH VIÊN TRÊN HEADER / DASHBOARD
// ======================================================================
async function loadStudentInfo() {
  const res = await fetch("/api/student/info");
  const result = await res.json();

  if (!result.success) return;

  const sv = result.data;

  // ===== HEADER =====
  const headerName = document.getElementById("header-student-name");
  if (headerName) headerName.innerText = sv.HoTen;

  // ===== PROFILE LEFT =====
  document.getElementById("display-name-big").innerText = sv.HoTen;
  document.getElementById("display-mssv-big").innerText = sv.MaSV;

  // ===== HỌC TẬP =====
  document.getElementById("info-mssv").innerText = sv.MaSV;
  document.getElementById("info-class").innerText = sv.Lop || "—";
  document.getElementById("info-khoa").innerText = sv.MaNganh || "—";

  // ===== LIÊN LẠC =====
  document.getElementById("info-email").innerText = sv.Email || "—";
  document.getElementById("info-phone").innerText = sv.SoDT || "—";
  document.getElementById("info-address").innerText = sv.DiaChi || "—";

  if (sv.NgaySinh) {
    const d = new Date(sv.NgaySinh);
    document.getElementById("info-dob").innerText =
      d.toLocaleDateString("vi-VN");
  }
}



// ======================================================================
// 2. LỊCH HỌC (THỜI KHÓA BIỂU) – DÙNG LichHoc (đã GROUP_CONCAT)
// ======================================================================
async function loadSchedule() {
    const tbody = document.getElementById("schedule-body");
    if (!tbody) return;

    const json = await apiGet("/api/student/schedule");
    tbody.innerHTML = "";

    if (!json.success || json.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Không có lịch học</td></tr>`;
        return;
    }

    json.data.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row.MaLHP}</td>
            <td>${row.TenMH}</td>
            <td>${row.LichHoc || ""}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ======================================================================
// 3. KẾT QUẢ HỌC TẬP
// ======================================================================
async function loadGrades() {
    const tbody = document.getElementById("grades-body");
    if (!tbody) return;

    const json = await apiGet("/api/student/grades");
    tbody.innerHTML = "";

    if (!json.success || json.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Chưa có điểm</td></tr>`;
        return;
    }

    json.data.forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${r.MaLHP}</td>
            <td>${r.TenMH}</td>
            <td>${r.SoTC}</td>
            <td>${r.DiemQT ?? "-"}</td>
            <td>${r.DiemCK ?? "-"}</td>
            <td>${r.DiemTK10 ?? "-"}</td>
            <td>${r.DiemChu ?? "-"}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ======================================================================
// 4. ĐĂNG KÝ HỌC PHẦN
// ======================================================================
async function loadRegisterPage() {
    const openBody = document.getElementById("open-courses-body");
    const myBody = document.getElementById("my-courses-body");
    if (!openBody || !myBody) return;

    // --- Lớp đang mở ---
    const openJson = await apiGet("/api/student/register/list");
    openBody.innerHTML = "";

    if (openJson.success && openJson.data.length > 0) {
        openJson.data.forEach(r => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td align="center">
                    <input type="checkbox" class="chk-lhp" value="${r.MaLHP}">
                </td>
                <td>${r.MaLHP}</td>
                <td>${r.TenMH}</td>
                <td align="center">${r.SoTC}</td>
                <td>${r.GiangVien}</td>
                <td align="center">${r.SiSoToiDa}</td>
                <td align="center">${r.SiSoHienTai}</td>
                <td>${r.LichHoc || ""}</td>
            `;
            openBody.appendChild(tr);
        });
    } else {
        openBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">Không có lớp mở</td></tr>`;
    }

    // --- Lớp đã đăng ký ---
    const myJson = await apiGet("/api/student/register/my");
    myBody.innerHTML = "";

    if (myJson.success && myJson.data.length > 0) {
        myJson.data.forEach(r => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${r.MaLHP}</td>
                <td>${r.TenMH}</td>
                <td align="center">${r.SoTC}</td>
                <td align="center">
                    <button class="btn-cancel" data-lhp="${r.MaLHP}"
                        style="background:#d9534f;color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;">
                        Hủy học phần
                    </button>
                </td>
            `;
            myBody.appendChild(tr);
        });

        // gán click hủy
        document.querySelectorAll(".btn-cancel").forEach(btn => {
            btn.addEventListener("click", async () => {
                const MaLHP = btn.dataset.lhp;
                const res = await apiPost("/api/student/register/cancel", { MaLHP });
                alert(res.message || "Đã hủy đăng ký");
                loadRegisterPage();
            });
        });
    } else {
        myBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Chưa đăng ký lớp nào</td></tr>`;
    }
}


async function registerSelected() {
    // 1. Lấy danh sách các checkbox đang được chọn
    const checked = document.querySelectorAll(".chk-lhp:checked");
    
    if (checked.length === 0) {
        alert("Bạn chưa chọn lớp học phần nào!");
        return;
    }

    let successCount = 0;
    let errorMessages = [];

    // 2. Duyệt qua từng môn đã chọn và gửi request
    for (let c of checked) {
        try {
            const res = await apiPost("/api/student/register/save", { MaLHP: c.value });
            
            if (res.success) {
                successCount++;
            } else {
                // Nếu lỗi (ví dụ: chưa đến đợt), lưu lại thông báo
                errorMessages.push(`Lớp ${c.value}: ${res.message}`);
            }
        } catch (err) {
            errorMessages.push(`Lớp ${c.value}: Lỗi kết nối`);
        }
    }

    // 3. Hiển thị kết quả tổng hợp
    if (errorMessages.length > 0) {
        // Có lỗi xảy ra với ít nhất 1 môn
        alert(`Kết quả đăng ký:\n- Thành công: ${successCount} môn\n- Thất bại:\n${errorMessages.join("\n")}`);
    } else {
        // Thành công tất cả
        alert("Đăng ký thành công tất cả các môn đã chọn!");
    }

    // 4. Load lại trang để cập nhật danh sách
    loadRegisterPage();
}

// ======================================================================
// 5. CHƯƠNG TRÌNH ĐÀO TẠO – GIỮ 6 CỘT + GROUP THEO HK + TỔNG TC + BADGE
// ======================================================================
async function loadCurriculum() {
  const container = document.getElementById("curriculum-container");
  if (!container) return;

  container.innerHTML = `
    <div style="padding:40px;text-align:center;color:#64748b">
      <i class="fa-solid fa-spinner fa-spin"></i> Đang tải chương trình đào tạo...
    </div>
  `;

  const json = await apiGet("/api/student/curriculum");
  if (!json.success || json.data.length === 0) {
    container.innerHTML = `<p>Không có dữ liệu chương trình đào tạo</p>`;
    return;
  }

  // Group theo Năm-HK
  const groups = {};
  json.data.forEach(r => {
    const key = `${r.Nam}-${r.HK}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });

  container.innerHTML = "";

  Object.keys(groups)
    .sort((a,b)=>{
      const [na,ha]=a.split("-").map(Number);
      const [nb,hb]=b.split("-").map(Number);
      return na!==nb ? na-nb : ha-hb;
    })
    .forEach(key => {
      const [Nam, HK] = key.split("-").map(Number);
      const list = groups[key];
      const totalTC = list.reduce((s,x)=>s + Number(x.SoTC),0);

      container.innerHTML += `
        <div class="semester-block">
          <div class="semester-header">
            <div class="semester-title">
              <i class="fa-solid fa-bookmark"></i>
              Năm ${Nam} - Học kỳ ${HK} (Kiến nghị)
            </div>
            <div class="semester-credits">Tổng: ${totalTC} TC</div>
          </div>

          <table class="curriculum-table">
            <thead>
              <tr>
                <th style="width:60px">STT</th>
                <th style="width:120px">Mã HP</th>
                <th>Tên học phần</th>
                <th style="width:80px">Số TC</th>
                <th style="width:120px">Loại</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              ${list.map((r,i)=>`
                <tr>
                  <td>${i+1}</td>
                  <td><b>${r.MaMH}</b></td>
                  <td>${r.TenMH}</td>
                  <td style="text-align:center;font-weight:700">${r.SoTC}</td>
                  <td>
                    <span class="badge ${r.LoaiMon==='BatBuoc'?'badge-required':'badge-elective'}">
                      ${r.LoaiMon==='BatBuoc'?'Bắt buộc':'Tự chọn'}
                    </span>
                  </td>
                  <td>${r.GhiChu || ''}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    });
}

// ============================
// LOAD LỊCH THI
// ============================
async function loadExamSchedule() {
    const tbody = document.getElementById("exam-body");
    if (!tbody) return;

    try {
        const res = await fetch("/api/student/exam-schedule");
        const data = await res.json();

        if (!data.success || data.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7">Không có lịch thi</td></tr>`;
            return;
        }

        tbody.innerHTML = data.data.map((e, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${e.MonThi}</td>
                <td>${e.HocKy}</td>
                <td>${new Date(e.NgayThi).toLocaleDateString("vi-VN")}</td>
                <td>${e.CaThi}</td>
                <td>${e.PhongThi}</td>
                <td>${e.GiamThi || ""}</td>
            </tr>
        `).join("");

    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="7">Lỗi tải dữ liệu</td></tr>`;
    }
}

document.addEventListener("DOMContentLoaded", loadExamSchedule);

// =====================================
// TRA CỨU HỌC PHẦN
// =====================================
async function searchCourse() {
    const maMH = document.getElementById("search-ma-mh")?.value.trim();
    const tenMH = document.getElementById("search-ten-mh")?.value.trim();
    const tbody = document.getElementById("course-search-body");

    if (!tbody) return;

    if (!maMH && !tenMH) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">Vui lòng nhập mã hoặc tên môn học</td>
            </tr>`;
        return;
    }

    try {
        const res = await fetch(
            `/api/student/course-search?maMH=${encodeURIComponent(maMH)}&tenMH=${encodeURIComponent(tenMH)}`
        );
        const result = await res.json();

        if (!result.success || result.data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">Không tìm thấy học phần phù hợp</td>
                </tr>`;
            return;
        }

        tbody.innerHTML = result.data.map((c, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${c.MaMH}</td>
                <td>${c.TenMH}</td>
                <td>${c.SoTC}</td>
                <td>${c.LoaiMon}</td>
                <td>${c.TenNganh || ""}</td>
            </tr>
        `).join("");

    } catch (err) {
        console.error(err);
        tbody.innerHTML = `
            <tr>
                <td colspan="6">Lỗi tải dữ liệu</td>
            </tr>`;
    }
}

// Gán sự kiện nút Tra cứu
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-search");
    if (btn) btn.addEventListener("click", searchCourse);
});


// ======================================================================
// 6. ĐĂNG NHẬP & ĐĂNG XUẤT + KHỞI ĐỘNG
// ======================================================================
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    // --- TRANG LOGIN ---
    // --- TRANG LOGIN ---
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const role = document.getElementById("role").value; // SinhVien / GiangVien / Admin

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, role }),
            });

            const data = await res.json();
            if (data.success) {
                window.location.href = data.redirect;
            } else {
                alert(data.message || "Đăng nhập thất bại");
            }
        } catch (err) {
            console.error("Lỗi login:", err);
            alert("Không thể kết nối server");
        }
    });

    return; // nếu đang ở trang login thì không load các phần khác
}



    // --- CÁC TRANG SAU KHI ĐĂNG NHẬP ---
    // loadStudentInfo();
    loadSchedule();
    loadGrades();
    loadRegisterPage();
    loadCurriculum();

    const btnSave = document.getElementById("btn-save-register");
    if (btnSave) btnSave.addEventListener("click", registerSelected);

    const logoutBtn = document.querySelector(".btn-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/";
        });
    }
});
// ===== Helper: escape HTML để tránh lỗi XSS & crash JS =====
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
