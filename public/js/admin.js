document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. KHAI BÁO BIẾN UI ---
    const btnLogout = document.getElementById("btnLogoutAdmin");
    const menuItems = document.querySelectorAll('.admin-menu li');
    const sections = document.querySelectorAll(".admin-content-section");

    // --- 2. HÀM HỖ TRỢ LOAD SCRIPT (Chỉ tải 1 lần duy nhất) ---
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            // Kiểm tra nếu script đã có trong DOM thì không tải lại
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve(); // Báo thành công ngay
                return;
            }
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Không tải được script: ${src}`));
            document.body.appendChild(script);
        });
    }

    // --- 3. HÀM CHUYỂN TAB VÀ LOAD DỮ LIỆU ---
    async function loadModule(targetId) {
        // 3.1. Xử lý giao diện (Active Menu & Section)
        menuItems.forEach(li => li.classList.remove("active"));
        const activeLi = document.querySelector(`li[data-target="${targetId}"]`);
        if (activeLi) activeLi.classList.add("active");

        sections.forEach(sec => sec.classList.remove("active"));
        const activeSection = document.getElementById(`admin-content-${targetId}`);
        if (!activeSection) return; // Nếu không tìm thấy section thì dừng
        activeSection.classList.add("active");

        // 3.2. Cấu hình đường dẫn cho từng module
        let viewUrl = null;
        let scriptPath = null;
        let initFunctionName = null;

        switch (targetId) {
            case 'welcome':
                return; // Trang chủ không cần load gì thêm
            case 'lhp': // QUẢN LÝ LỚP HỌC PHẦN
                viewUrl = '/views/admin/lophocphan.html';
                scriptPath = '/js/lophocphan.js';
                initFunctionName = 'initLopHocPhan';
                break;
            case 'dkhp': // QUẢN LÝ ĐĂNG KÝ HỌC PHẦN
                viewUrl = '/views/admin/dangkylhp.html';
                scriptPath = '/js/dangkylhp.js';
                // Giả sử bên file dangkylhp.js bạn cũng đặt tên hàm là initDangKyLHP
                // Nếu chưa có, hãy vào file đó thêm: window.initDangKyLHP = ...
                initFunctionName = 'initDangKyLHP'; 
                break;
            case 'dm': // QUẢN LÝ DANH MỤC
                viewUrl = '/views/admin/category.html';
                scriptPath = '/js/category.js';
                initFunctionName = 'initCategory';
                break;
            case 'users': // QUẢN LÝ NGƯỜI DÙNG
                viewUrl = '/views/admin/nguoidung.html';
                scriptPath = '/js/nguoidung.js';
                initFunctionName = 'initNguoiDung';
                break;
            case 'lichthi':
                    viewUrl = '/views/admin/lichthi.html';
                    scriptPath = '/js/lichthi.js'; // ✅ SỬA Ở ĐÂY
                    initFunctionName = 'initLichThi';
                    break;
                            case 'baocao':
    viewUrl = '/views/admin/baocao.html';
    scriptPath = '/js/baocao.js';
    initFunctionName = 'initBaoCao';
    break;

             case 'diem':
    viewUrl = '/views/admin/diem.html';
    scriptPath = '/js/diem.js';
    initFunctionName = 'initDiem';
    break;

             


            // Thêm các case khác (lichthi, diem...) tương tự
            default:
                console.warn(`Chưa cấu hình cho module: ${targetId}`);
                return;
        }

        // 3.3. Thực hiện tải HTML và Script
        if (viewUrl) {
            try {
                // Reset nội dung đang có để tránh ID trùng lặp
                activeSection.innerHTML = '<div style="padding:20px">Đang tải dữ liệu...</div>';

                // Tải HTML view
                const res = await fetch(viewUrl);
                if (!res.ok) throw new Error(`Lỗi tải view: ${res.statusText}`);
                const html = await res.text();
                
                // Đổ HTML vào section
                activeSection.innerHTML = html;

                // Tải Script JS (nếu có) và chạy hàm khởi tạo
                if (scriptPath) {
                    await loadScript(scriptPath);
                    
                    // Gọi hàm khởi tạo tương ứng (nếu tồn tại)
                    if (initFunctionName && typeof window[initFunctionName] === 'function') {
                        console.log(`Đang khởi chạy: ${initFunctionName}`);
                        window[initFunctionName](); 
                    } else {
                        console.warn(`Hàm khởi tạo ${initFunctionName} không tồn tại hoặc chưa được export ra window.`);
                    }
                }
            } catch (err) {
                console.error(err);
                activeSection.innerHTML = `<div style="color:red; padding:20px">Lỗi: ${err.message}</div>`;
            }
        }
    }

    // --- 4. GẮN SỰ KIỆN CLICK MENU ---
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            const target = item.getAttribute("data-target");
            loadModule(target);
        });
    });

    // --- 5. XỬ LÝ ĐĂNG XUẤT ---
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            if(confirm("Bạn có chắc muốn đăng xuất?")) {
                fetch("/api/auth/logout", { method: "POST" })
                    .then(() => window.location.href = "/")
                    .catch(err => console.error(err));
            }
        });
    }

});