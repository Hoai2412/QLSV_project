USE qlsv_monhoc;

-- 1. Khoa & Ngành
INSERT INTO Khoa (MaKhoa, TenKhoa) VALUES 
('CNTT', 'Công nghệ thông tin'),
('KT', 'Kinh tế');

INSERT INTO Nganh (MaNganh, TenNganh, MaKhoa) VALUES 
('IT01', 'Kỹ thuật phần mềm', 'CNTT'),
('IT02', 'Hệ thống thông tin', 'CNTT'),
('KT01', 'Quản trị kinh doanh', 'KT');

-- 2. Học kỳ
INSERT INTO HocKy (MaHK, Ky, NamHoc, TuNgay, DenNgay, NgayDangKyBD, NgayDangKyKT) VALUES 
('20251', 1, '2025-2026', '2025-09-05', '2026-01-15', '2025-08-01', '2025-08-30');

-- 3. Môn học
INSERT INTO MonHoc (MaMH, TenMH, SoTC) VALUES 
('INT1001', 'Nhập môn lập trình', 3),
('INT1002', 'Cấu trúc dữ liệu', 3),
('INT1003', 'Lập trình Web', 3),
('ECO1001', 'Kinh tế vi mô', 3);

-- 4. Phòng học
INSERT INTO PhongHoc (MaPhong, TenPhong, SucChua) VALUES 
('A201', 'Phòng A201', 50),
('B102', 'Phòng Lab B102', 40);

-- 5. Giảng viên & Sinh viên
INSERT INTO GiangVien (MaGV, HoTen, MaKhoa) VALUES 
('GV01', 'Nguyễn Văn Thầy', 'CNTT'),
('GV02', 'Lê Thị Cô', 'KT');

INSERT INTO SinhVien (MaSV, HoTen, MaNganh, Lop) VALUES 
('SV001', 'Trần Văn Sinh', 'IT01', 'K15-PM'),
('SV002', 'Nguyễn Thị Viên', 'KT01', 'K15-QT');

-- 6. Tài khoản (QUAN TRỌNG: Mật khẩu test là 123456)
-- Trong code Nodejs tôi để tạm so sánh string, thực tế phải hash
INSERT INTO TaiKhoan (Username, MatKhauHash, VaiTro, MaSV, MaGV) VALUES 
('admin', '123456', 'Admin', NULL, NULL),
('sv001', '123456', 'SinhVien', 'SV001', NULL),
('gv01', '123456', 'GiangVien', NULL, 'GV01');

-- 7. Lớp học phần
INSERT INTO LopHocPhan (MaLHP, MaMH, MaHK, MaGV, SiSoToiDa, TrangThai) VALUES 
('LHP001', 'INT1003', '20251', 'GV01', 60, 'A'),
('LHP002', 'INT1001', '20251', 'GV01', 60, 'A');

-- 8. Lịch học
INSERT INTO LichHoc (MaLHP, MaPhong, Thu, TietBD, TietKT) VALUES 
('LHP001', 'A201', 2, 1, 3), -- Thứ 2, Tiết 1-3
('LHP002', 'B102', 4, 7, 9); -- Thứ 4, Tiết 7-9

-- 1.thêm khoa
INSERT INTO Khoa (MaKhoa, TenKhoa) VALUES
('SP', 'Sư phạm'),
('NN', 'Ngôn ngữ – Văn hoá'),
('KHXH', 'Khoa học xã hội và nhân văn'),
('KHTN', 'Khoa học tự nhiên'),
('KTK', 'Kỹ thuật – Công nghệ'),
('MT', 'Môi trường – Tài nguyên');
-- 2. thêm ngành 
INSERT INTO Nganh (MaNganh, TenNganh, MaKhoa) VALUES
('7140114', 'Quản lý Giáo dục', 'SP'),
('7140201', 'Giáo dục Mầm non', 'SP'),
('7140202', 'Giáo dục Tiểu học', 'SP'),
('7140205', 'Giáo dục Chính trị', 'SP'),
('7140206', 'Giáo dục Thể chất', 'SP'),
('7140209', 'Sư phạm Toán học', 'SP'),
('7140211', 'Sư phạm Vật lý', 'SP'),
('7140212', 'Sư phạm Hóa học', 'SP'),
('7140213', 'Sư phạm Sinh học', 'SP'),
('7140217', 'Sư phạm Ngữ văn', 'SP'),
('7140218', 'Sư phạm Lịch sử', 'SP'),
('7140219', 'Sư phạm Địa lý', 'SP'),
('7140231', 'Sư phạm Tiếng Anh', 'SP'),
('7140247', 'Sư phạm Khoa học tự nhiên', 'SP'),
('7140249', 'Sư phạm Lịch sử - Địa lý', 'SP'),

('7220201', 'Ngôn ngữ Anh', 'NN'),
('7220204', 'Ngôn ngữ Trung Quốc', 'NN'),
('7229030', 'Văn học', 'NN'),
('7310608', 'Đông phương học', 'NN'),
('7310630', 'Việt Nam học', 'NN'),

('7310101', 'Kinh tế', 'KT'),
('7310205', 'Quản lý nhà nước', 'KT'),
('7760101', 'Công tác xã hội', 'KT'),
('7340301', 'Kế toán', 'KT'),
('7340301ACCA', 'Kế toán - Định hướng ACCA', 'KT'),
('7340302', 'Kiểm toán', 'KT'),
('7340201', 'Tài chính – Ngân hàng', 'KT'),
('7510605', 'Logistics và Quản lý chuỗi cung ứng', 'KT'),
('7810103', 'Quản trị dịch vụ du lịch và lữ hành', 'KT'),
('7810201', 'Quản trị khách sạn', 'KT'),

('7440112', 'Hóa học', 'KHTN'),
('7440122', 'Khoa học dữ liệu', 'KHTN'),
('7460112', 'Toán ứng dụng', 'KHTN'),

('7480107', 'Trí tuệ nhân tạo', 'KTK'),
('7480201', 'Công nghệ thông tin', 'KTK'),
('7510205', 'Công nghệ kỹ thuật ô tô', 'KTK'),
('7510401', 'Công nghệ kỹ thuật hóa học', 'KTK'),
('7520116', 'Kỹ thuật cơ khí động lực', 'KTK'),
('7520201', 'Kỹ thuật điện', 'KTK'),
('7520207', 'Kỹ thuật điện tử - viễn thông', 'KTK'),
('7520216', 'Kỹ thuật Điều khiển và Tự động hóa', 'KTK'),
('7520401', 'Vật lý kỹ thuật', 'KTK'),
('7540101', 'Công nghệ thực phẩm', 'KTK'),
('7580201', 'Kỹ thuật xây dựng', 'KTK'),

('7620109', 'Nông học', 'MT'),
('7850101', 'Quản lý tài nguyên và môi trường', 'MT'),
('7850103', 'Quản lý đất đai', 'MT');
-- 3. thêm giảng viên
INSERT INTO GiangVien (MaGV, HoTen, MaKhoa) VALUES
('GV001','Nguyễn Hữu Thắng','CNTT'),
('GV002','Trần Văn Đức','CNTT'),
('GV003','Lê Minh Hòa','CNTT'),
('GV004','Nguyễn Thị Cẩm','KT'),
('GV005','Lê Quốc Trí','KT'),
('GV006','Phạm Minh Hải','SP'),
('GV007','Nguyễn Mỹ Duyên','SP'),
('GV008','Trần Văn Thọ','NN'),
('GV009','Ngô Minh Nhật','NN'),
('GV010','Đặng Thị Hà','KHXH'),
('GV011','Tạ Minh Thu','KHXH'),
('GV012','Nguyễn Văn Lực','KHTN'),
('GV013','Lê Hoàng Nam','KHTN'),
('GV014','Trần Phúc Hưng','KTK'),
('GV015','Đỗ Thanh Bình','KTK'),
('GV016','Nguyễn Văn Trí','KTK'),
('GV017','Phạm Văn Hậu','MT'),
('GV018','Lê Thị Xuân','MT'),
('GV019','Hoàng Ngọc Tâm','CNTT'),
('GV020','Trần Nhã Trân','CNTT'),
('GV021','Nguyễn Hoàng Yến','KT'),
('GV022','Đặng Thị Ly','KT'),
('GV023','Trương Văn Long','SP'),
('GV024','Đào Thị Dung','SP'),
('GV025','Dương Thanh Tú','NN'),
('GV026','Hoàng Thị Mỹ','NN'),
('GV027','Lê Thanh Danh','KHXH'),
('GV028','Nguyễn Mai Lan','KHXH'),
('GV029','Vũ Mỹ Linh','KHTN'),
('GV030','Phan Thanh Lộc','KHTN'),
('GV031','Đỗ Hoàng Khánh','KTK'),
('GV032','Bùi Hải Nam','KTK'),
('GV033','Nguyễn Tấn Phát','KTK'),
('GV034','Lý Kim Thoa','MT'),
('GV035','Trần Thuỷ Dương','MT'),
('GV036','Nguyễn Anh Tú','CNTT'),
('GV037','Dương Thanh Bình','KT'),
('GV038','Trương Mỹ Vân','SP'),
('GV039','Nguyễn Như Ý','NN'),
('GV040','Phan Kim Ngọc','KHXH'),
('GV041','Trần Minh Hiếu','KHTN'),
('GV042','Lê Ánh Tuyết','KTK'),
('GV043','Nguyễn Hoài Phong','MT'),
('GV044','Võ Đình Trí','CNTT'),
('GV045','Bùi Nhật Hào','KT'),
('GV046','Phạm Hoàng Nhi','SP'),
('GV047','Lê Minh Hoàng','NN'),
('GV048','Lý Hoàng Bảo','MT'),
('GV049','Trần Ái Vy','KTK'),
('GV050','Đào Minh Ngọc','KHTN');
-- 4. thêm monhoc
INSERT INTO MonHoc (MaMH, TenMH, SoTC) VALUES
('MH001','Nhập môn lập trình',3),
('MH002','Lập trình Web',3),
('MH003','Cơ sở dữ liệu',3),
('MH004','Giải thuật',3),
('MH005','Trí tuệ nhân tạo',3),
('MH006','Nguyên lý kế toán',3),
('MH007','Marketing căn bản',3),
('MH008','Kinh tế vi mô',3),
('MH009','Kinh tế vĩ mô',3),
('MH010','Tài chính doanh nghiệp',3),
('MH011','Tiếng Anh 1',3),
('MH012','Tiếng Anh 2',3),
('MH013','Hóa đại cương',3),
('MH014','Xác suất thống kê',3),
('MH015','Toán cao cấp A1',3),
('MH016','Toán cao cấp A2',3),
('MH017','Kỹ năng mềm',2),
('MH018','Giáo dục thể chất',2),
('MH019','Lý luận chính trị',3),
('MH020','Ngôn ngữ học đại cương',3),
('MH021','Văn học Việt Nam',3),
('MH022','Địa lý tự nhiên',3),
('MH023','Lịch sử thế giới',3),
('MH024','Sinh học đại cương',3),
('MH025','Công nghệ thực phẩm cơ bản',3),
('MH026','Kỹ thuật điện',3),
('MH027','Kỹ thuật điện tử',3),
('MH028','Điều khiển tự động',3),
('MH029','Triết học Mác-Lênin',3),
('MH030','Hóa phân tích',3),
('MH031','Hóa lý',3),
('MH032','Nông học đại cương',3),
('MH033','Khoa học dữ liệu cơ bản',3),
('MH034','Machine Learning',3),
('MH035','Phân tích dữ liệu',3),
('MH036','Cấu trúc dữ liệu',3),
('MH037','Hệ điều hành',3),
('MH038','An toàn thông tin',3),
('MH039','Mạng máy tính',3),
('MH040','Thiết kế phần mềm',3),
('MH041','Phương pháp nghiên cứu khoa học',3),
('MH042','Pháp luật đại cương',3),
('MH043','Kỹ thuật lập trình nâng cao',3),
('MH044','Thương mại điện tử',3),
('MH045','Quản trị học',3),
('MH046','Tâm lý học đại cương',3),
('MH047','Công tác xã hội đại cương',3),
('MH048','Logistics cơ bản',3),
('MH049','An toàn lao động',2),
('MH050','Hệ thống nhúng',3),
('MH051','Cơ học kết cấu',3),
('MH052','Động cơ đốt trong',3),
('MH053','Hệ thống điện thông minh',3),
('MH054','Phân tích tài chính',3),
('MH055','Kiểm toán căn bản',3),
('MH056','Hóa hữu cơ',3),
('MH057','Hóa vô cơ',3),
('MH058','Quản lý đất đai',3),
('MH059','Công nghệ môi trường',3),
('MH060','Quản lý tài nguyên thiên nhiên',3);