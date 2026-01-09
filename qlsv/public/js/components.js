document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     ROUTE CONFIG (KHÔNG .html)
  ========================= */
  const routes = [
    {
      path: "/student",
      label: "Trang chủ",
      icon: "fa-house",
      title: "Dashboard"
    },
    {
      path: "/student/schedule",
      label: "Lịch học",
      icon: "fa-calendar-days",
      title: "Thời khóa biểu"
    },
    {
      path: "/student/register",
      label: "Đăng ký học phần",
      icon: "fa-pen-to-square",
      title: "Đăng ký học phần"
    },
    {
      path: "/student/course-search",
      label: "Tra cứu học phần",
      icon: "fa-search",
      title: "Tra cứu học phần"
    },
    {
      path: "/student/curriculum",
      label: "Chương trình đào tạo",
      icon: "fa-calendar-alt",
      title: "Chương trình đào tạo"
    },
    {
      path: "/student/grades",
      label: "Kết quả học tập",
      icon: "fa-chart-simple",
      title: "Kết quả học tập"
    },
    {
      path: "/student/exam-schedule",
      label: "Lịch thi",
      icon: "fa-calendar-check",
      title: "Lịch thi"
    }
  ];

  const currentPath = window.location.pathname;

  /* =========================
     SIDEBAR
  ========================= */
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.innerHTML = `
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand">
            <i class="fa-solid fa-graduation-cap"></i>
            <span>TRƯỜNG ĐẠI HỌC QUY NHƠN</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          ${routes.map(r => {
            const isActive =
              currentPath === r.path ||
              (r.path !== "/student" && currentPath.startsWith(r.path));

            return `
              <a class="nav-item ${isActive ? "active" : ""}" href="${r.path}">
                <i class="fa-solid ${r.icon}"></i>
                <span>${r.label}</span>
              </a>
            `;
          }).join("")}
        </nav>

        <div class="sidebar-bottom">
          <button class="logout-btn" id="btn-logout">
            <i class="fa-solid fa-right-from-bracket"></i>
            Đăng xuất
          </button>
        </div>
      </aside>
    `;
  }

  /* =========================
     HEADER
  ========================= */
  const header = document.getElementById("header");
  if (header) {
    const currentRoute = routes.find(r =>
      currentPath === r.path ||
      (r.path !== "/student" && currentPath.startsWith(r.path))
    );

    header.innerHTML = `
      <header class="header">
        <h2 class="header-title">
          ${currentRoute ? currentRoute.title : "Student Portal"}
        </h2>

        <div class="header-right">
          <button class="icon-btn">
            <i class="fa-regular fa-bell"></i>
          </button>

          <div class="user">
            <div class="user-text">
              <div class="user-name" id="header-student-name">Sinh viên</div>
              <div class="user-role">Sinh viên</div>
            </div>
            <div class="user-avatar">SV</div>
          </div>
        </div>
      </header>
    `;
  }

  /* =========================
     LOGOUT
  ========================= */
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    });
  }
});

// =========================
// GỌI LOAD DATA SAU KHI UI ĐÃ INJECT
// =========================
setTimeout(() => {
  if (typeof loadStudentInfo === "function") {
    loadStudentInfo();
  }
}, 0);
