// public/js/diemHistory.js
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

  try {
    // ✅ ĐÚNG endpoint vì server mount /api/diem
    const res = await fetch(`/api/diem/lophocphan/${encodeURIComponent(MaLHP)}/history`);

    // Nếu 404/500 -> đọc text để debug, nhưng không parse JSON
    if (!res.ok) {
      const text = await res.text();
      console.error("HTTP error:", res.status, text.slice(0, 300));
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:14px;">Lỗi tải lịch sử (HTTP ${res.status})</td></tr>`;
      return;
    }

    const json = await res.json();

    if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:14px;">Chưa có lịch sử</td></tr>`;
      return;
    }

    tbody.innerHTML = "";

    json.data.forEach(r => {
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

  } catch (err) {
    console.error("loadHistory error:", err);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:14px;">Lỗi tải lịch sử</td></tr>`;
  }
}

document.addEventListener("DOMContentLoaded", loadHistory);
