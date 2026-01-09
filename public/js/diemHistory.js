// public/js/diemHistory.js
let _historyCache = [];

// Render table
function renderHistory(rows) {
  const tbody = document.getElementById("history-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!rows || rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:14px;">Không có dữ liệu phù hợp</td></tr>`;
    return;
  }

  rows.forEach((r) => {
    const time = r.ThoiGian ? new Date(r.ThoiGian).toLocaleString("vi-VN") : "";
    tbody.innerHTML += `
      <tr>
        <td>${time}</td>
        <td>${r.NguoiSua || ""}</td>
        <td>${r.MaSV || ""}</td>
        <td>${r.HoTen || ""}</td>
        <td>${r.NoiDung || ""}</td>
      </tr>
    `;
  });
}

// Apply search
function applyHistorySearch() {
  const input = document.getElementById("his-keyword");
  const select = document.getElementById("his-field");

  // Nếu trang không có search bar thì thôi
  if (!input || !select) return;

  const keyword = (input.value || "").trim().toLowerCase();
  const field = select.value;

  if (!keyword) {
    renderHistory(_historyCache);
    return;
  }

  const filtered = _historyCache.filter((r) => {
    const msv = String(r.MaSV || "").toLowerCase();
    const hoten = String(r.HoTen || "").toLowerCase();
    const nguoisua = String(r.NguoiSua || "").toLowerCase();
    const noidung = String(r.NoiDung || "").toLowerCase();

    if (field === "msv") return msv.includes(keyword);
    if (field === "hoten") return hoten.includes(keyword);
    if (field === "nguoisua") return nguoisua.includes(keyword);
    if (field === "noidung") return noidung.includes(keyword);

    return false;
  });

  renderHistory(filtered);
}

// Bind search events (không để crash)
function bindHistorySearchEvents() {
  const input = document.getElementById("his-keyword");
  const select = document.getElementById("his-field");
  const btnSearch = document.getElementById("btn-his-search");
  const btnClear = document.getElementById("btn-his-clear");

  // Nếu thiếu element thì bỏ qua (không crash)
  if (!input || !select || !btnSearch || !btnClear) {
    console.warn("[History] Missing search elements:", { input, select, btnSearch, btnClear });
    return;
  }

  // tránh bind nhiều lần
  if (btnSearch._bound) return;
  btnSearch._bound = true;

  btnSearch.addEventListener("click", applyHistorySearch);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") applyHistorySearch();
  });

  select.addEventListener("change", () => {
    if (input.value.trim()) applyHistorySearch();
  });

  btnClear.addEventListener("click", () => {
    input.value = "";
    select.value = "msv";
    renderHistory(_historyCache);
  });
}

async function loadHistory() {
  const tbody = document.getElementById("history-tbody");
  const title = document.getElementById("title");

  if (!tbody) return;

  const url = new URL(window.location.href);
  const MaLHP = url.searchParams.get("malhp");

  if (title && MaLHP) title.innerText = `Lịch sử sửa điểm - ${MaLHP}`;

  if (!MaLHP) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:14px;">Thiếu tham số malhp</td></tr>`;
    return;
  }

  // 1) Fetch dữ liệu (tách riêng để dễ debug)
  let json;
  try {
    const res = await fetch(`/api/diem/lophocphan/${encodeURIComponent(MaLHP)}/history`);

    if (!res.ok) {
      const text = await res.text();
      console.error("HTTP error:", res.status, text.slice(0, 300));
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:14px;">Lỗi tải lịch sử (HTTP ${res.status})</td></tr>`;
      return;
    }

    json = await res.json();
  } catch (e) {
    console.error("Fetch/parse error:", e);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:14px;">Lỗi tải lịch sử (fetch)</td></tr>`;
    return;
  }

  // 2) Render dữ liệu
  if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:14px;">Chưa có lịch sử</td></tr>`;
    return;
  }

  _historyCache = json.data;
  renderHistory(_historyCache);

  // 3) Bind filter (đặt try riêng để filter không phá load)
  try {
    bindHistorySearchEvents();
  } catch (e) {
    console.error("Bind search error:", e);
    // không hiển thị lỗi tải lịch sử nữa vì dữ liệu đã load ok
  }
}

document.addEventListener("DOMContentLoaded", loadHistory);
