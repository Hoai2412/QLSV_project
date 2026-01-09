// public/js/diem.js
async function apiGet(url) {
  const res = await fetch(url);
  return await res.json();
}

async function apiPost(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return await res.json();
}

function badgeTrangThai(trangThai) {
  if (trangThai === "Khoa") return `<span class="badge badge-lock">Khoá</span>`;
  return `<span class="badge badge-open">Mở</span>`;
}

async function loadLHPAdmin() {
  // ✅ đúng ID theo diem.html
  const tbody = document.getElementById("lhp-tbody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">Đang tải...</td></tr>`;

  let json;
  try {
    json = await apiGet("/api/diem/lophocphan");
  } catch (e) {
    console.error(e);
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">Lỗi tải dữ liệu</td></tr>`;
    return;
  }

  if (!json.success || !Array.isArray(json.data)) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">Không có dữ liệu</td></tr>`;
    return;
  }

  const data = json.data;
  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">Không có lớp học phần</td></tr>`;
    return;
  }

  tbody.innerHTML = "";

  data.forEach((r, i) => {
    const trangThai = r.TrangThaiSoDiem || "Mo";
    const siSo = `${r.SiSoHienTai || 0}/${r.SiSoToiDa || 0}`;
    const soDiem = r.SoDiem || 0;

    const btnToggle =
      trangThai === "Khoa"
        ? `<button class="btn btn-open" data-action="toggle" data-malhp="${r.MaLHP}" data-state="Mo">Mở sổ</button>`
        : `<button class="btn btn-lock" data-action="toggle" data-malhp="${r.MaLHP}" data-state="Khoa">Khoá sổ</button>`;

    const btnHistory = `<a class="btn btn-history" href="/admin/diem/history?malhp=${encodeURIComponent(
      r.MaLHP
    )}">Lịch sử</a>`;

    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${r.MaLHP}</td>
        <td>${r.TenMH}</td>
        <td>${r.SoTC}</td>
        <td>${r.MaHK}</td>
        <td>${siSo}</td>
        <td>${badgeTrangThai(trangThai)}</td>
        <td>${soDiem}</td>
        <td style="display:flex; gap:8px; justify-content:center;">
          ${btnToggle}
          ${btnHistory}
        </td>
      </tr>
    `;
  });

  tbody.querySelectorAll('[data-action="toggle"]').forEach((btn) => {
    btn.addEventListener("click", async () => {
      const MaLHP = btn.dataset.malhp;
      const TrangThai = btn.dataset.state;

      const ok = confirm(
        TrangThai === "Khoa"
          ? `Khoá sổ điểm cho lớp ${MaLHP}? (GV sẽ không lưu điểm được)`
          : `Mở sổ điểm cho lớp ${MaLHP}?`
      );
      if (!ok) return;

      const rs = await apiPost("/api/diem/lophocphan/toggle", { MaLHP, TrangThai });
      if (rs.success) {
        await loadLHPAdmin();
      } else {
        alert(rs.message || "Lỗi cập nhật trạng thái sổ");
      }
    });
  });
}

// ✅ admin.js sẽ gọi hàm này sau khi inject diem.html
function initDiem() {
  loadLHPAdmin();
}
window.initDiem = initDiem;
