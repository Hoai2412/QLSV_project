-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th12 09, 2025 lúc 03:18 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `qlsv_monhoc`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bangdiem`
--

CREATE TABLE `bangdiem` (
  `ID` int(11) NOT NULL,
  `DangKyID` int(11) NOT NULL,
  `TyLeQT` decimal(3,2) DEFAULT 0.40,
  `TyLeCK` decimal(3,2) DEFAULT 0.60,
  `DiemQT` decimal(4,2) DEFAULT NULL,
  `DiemCK` decimal(4,2) DEFAULT NULL,
  `DiemTK10` decimal(4,2) DEFAULT NULL,
  `DiemChu` enum('A','B','C','D','F') DEFAULT NULL,
  `KetQua` enum('Đạt','Rớt') DEFAULT NULL,
  `IsLocked` tinyint(4) DEFAULT 0,
  `NgayKhoa` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `bangdiem`
--

INSERT INTO `bangdiem` (`ID`, `DangKyID`, `TyLeQT`, `TyLeCK`, `DiemQT`, `DiemCK`, `DiemTK10`, `DiemChu`, `KetQua`, `IsLocked`, `NgayKhoa`) VALUES
(1, 1, 0.40, 0.60, 7.50, 8.00, 7.80, 'B', 'Đạt', 0, NULL),
(2, 2, 0.40, 0.60, 8.00, 7.00, 7.40, 'B', 'Đạt', 0, NULL),
(3, 3, 0.40, 0.60, 6.50, 7.00, 6.80, 'C', 'Đạt', 0, NULL),
(4, 4, 0.40, 0.60, 7.00, 6.00, 6.40, 'C', 'Đạt', 0, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `dangkyhocphan`
--

CREATE TABLE `dangkyhocphan` (
  `ID` int(11) NOT NULL,
  `MaSV` varchar(12) NOT NULL,
  `MaLHP` varchar(10) NOT NULL,
  `MaHK` varchar(10) NOT NULL,
  `NgayDK` datetime DEFAULT current_timestamp(),
  `TrangThai` enum('DaDangKy','DaHuy') DEFAULT 'DaDangKy',
  `HocPhi` decimal(10,0) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `dangkyhocphan`
--

INSERT INTO `dangkyhocphan` (`ID`, `MaSV`, `MaLHP`, `MaHK`, `NgayDK`, `TrangThai`, `HocPhi`) VALUES
(1, '440001', 'LWEB01', '2021HK01', '2025-11-30 22:08:10', 'DaHuy', 1050000),
(2, '440001', 'CSDL01', '2021HK01', '2025-11-30 22:08:10', 'DaHuy', 1050000),
(3, '440002', 'LWEB02', '2021HK01', '2025-11-30 22:08:10', 'DaDangKy', 1050000),
(4, '440003', 'DSA01', '2021HK02', '2025-11-30 22:08:10', 'DaDangKy', 1400000),
(5, '440001', 'LWEB01', '2021HK01', '2025-11-30 22:41:08', 'DaHuy', 0),
(6, '440001', 'LWEB01', '2021HK01', '2025-11-30 22:41:08', 'DaHuy', 0),
(7, '440001', 'DSA01', '2021HK01', '2025-11-30 23:12:17', 'DaHuy', 0),
(14, '440001', 'LWEB01', '2024HK01', '2025-12-01 00:52:53', 'DaHuy', 0),
(15, '440001', 'CSDL01', '2021HK01', '2025-12-01 01:29:35', 'DaHuy', 0),
(16, '440001', 'DSA01', '2021HK02', '2025-12-01 01:29:35', 'DaHuy', 0),
(17, '440001', 'LWEB02', '2021HK01', '2025-12-01 01:29:35', 'DaHuy', 0),
(18, '440001', 'DSA01', '2021HK02', '2025-12-01 20:06:06', 'DaHuy', 0),
(19, '440001', 'LWEB02', '2021HK01', '2025-12-07 19:28:13', 'DaHuy', 0),
(20, '440001', 'CSDL01', '2021HK01', '2025-12-07 19:29:25', 'DaHuy', 0),
(21, '440001', 'CSDL01', '2024HK01', '2025-12-07 22:05:15', 'DaDangKy', 0),
(22, '440001', 'LWEB01', '2024HK01', '2025-12-07 22:07:51', 'DaDangKy', 0),
(23, '440001', 'LWEB02', '2024HK01', '2025-12-07 22:07:57', 'DaHuy', 0),
(24, '440001', 'LWEB02', '2024HK01', '2025-12-07 22:34:21', 'DaHuy', 0),
(25, '440001', 'DSA01', '2024HK02', '2025-12-09 08:53:19', 'DaDangKy', 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `dotdangky`
--

CREATE TABLE `dotdangky` (
  `ID` int(11) NOT NULL,
  `TenDot` varchar(255) NOT NULL,
  `MaHK` varchar(10) NOT NULL,
  `NgayBatDau` datetime NOT NULL,
  `NgayKetThuc` datetime NOT NULL,
  `HanMucTinChi` int(11) DEFAULT 25,
  `TrangThai` enum('Active','Inactive') DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `dotdangky`
--

INSERT INTO `dotdangky` (`ID`, `TenDot`, `MaHK`, `NgayBatDau`, `NgayKetThuc`, `HanMucTinChi`, `TrangThai`) VALUES
(1, 'Đợt đăng ký chính thức HK1 2024-2025', '2024HK01', '2024-08-15 08:00:00', '2024-08-25 17:00:00', 25, 'Active'),
(2, 'Đợt đăng ký bổ sung HK1 2024-2025', '2024HK01', '2024-09-05 08:00:00', '2024-09-10 17:00:00', 25, 'Active'),
(3, 'Đợt 1 HK1 2024-2025', '2024HK01', '2025-12-06 08:00:00', '2025-12-08 17:00:00', 20, 'Active'),
(6, 'Đợt 2 HK2 2024 2025', '2024HK02', '2025-12-08 08:00:00', '2025-12-17 00:00:00', 20, 'Active'),
(7, 'Đợt 1 HK2 2025 - 2026', '2025HK02', '2025-12-08 08:00:00', '2025-12-09 09:00:00', 20, 'Active'),
(8, 'Đợt 2 HK2 2024 2025', '2024HK02', '2025-12-01 09:00:00', '2025-12-10 09:00:00', 20, 'Active');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `giangvien`
--

CREATE TABLE `giangvien` (
  `MaGV` varchar(10) NOT NULL,
  `HoTen` varchar(100) NOT NULL,
  `Email` varchar(150) DEFAULT NULL,
  `SoDT` varchar(20) DEFAULT NULL,
  `HocVi` varchar(50) DEFAULT NULL,
  `BoMon` varchar(100) DEFAULT NULL,
  `TrangThai` enum('Active','Inactive') DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `giangvien`
--

INSERT INTO `giangvien` (`MaGV`, `HoTen`, `Email`, `SoDT`, `HocVi`, `BoMon`, `TrangThai`) VALUES
('GV001', 'Phan Bảo Huy', 'binh@abc.edu.vn', '0912345678', 'ThS', 'CNPM', 'Active'),
('GV002', 'Thu Hoài', 'phuc@abc.edu.vn', '0911222333', 'ThS', 'ATTT', 'Active'),
('GV003', 'Võ Thùy Linh', 'linh@abc.edu.vn', '0988776655', 'TS', 'ATTT', 'Active'),
('GV010', 'TS. Ngô Bảo Châu', NULL, NULL, NULL, 'CNTT', 'Active'),
('GV011', 'ThS. Đặng Thái Sơn', NULL, NULL, NULL, 'KHDL', 'Active');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hocky`
--

CREATE TABLE `hocky` (
  `MaHK` varchar(10) NOT NULL,
  `MaNamHoc` varchar(9) NOT NULL,
  `TenHK` varchar(50) NOT NULL,
  `ThuTu` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `hocky`
--

INSERT INTO `hocky` (`MaHK`, `MaNamHoc`, `TenHK`, `ThuTu`) VALUES
('2021HK01', '2021-2022', 'HK01', 1),
('2021HK02', '2021-2022', 'HK02', 2),
('2022HK01', '2022-2023', 'HK01', 1),
('2022HK02', '2022-2023', 'HK02', 2),
('2024HK01', '2024-2025', 'HK01', 1),
('2024HK02', '2024-2025', 'HK02', 2),
('2024HK03', '2024-2025', 'HK hè', 3),
('2025HK01', '2025-2026', 'HK01', 1),
('2025HK02', '2025-2026', 'HK02', 2),
('2025HK03', '2025-2026', 'HK hè', 3);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `khoa`
--

CREATE TABLE `khoa` (
  `MaKhoa` varchar(10) NOT NULL,
  `TenKhoa` varchar(100) NOT NULL,
  `MoTa` varchar(255) DEFAULT NULL,
  `TrangThai` enum('Active','Inactive') DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `khoa`
--

INSERT INTO `khoa` (`MaKhoa`, `TenKhoa`, `MoTa`, `TrangThai`) VALUES
('ATTT', 'An toàn thông tin', NULL, 'Active'),
('CNTT', 'Công nghệ thông tin', NULL, 'Active'),
('KTKT', 'Kinh tế - Kế toán', NULL, 'Active'),
('KTPM', 'Kỹ thuật phần mềm', NULL, 'Active'),
('SP', 'Sư phạm', NULL, 'Active');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lichhoc`
--

CREATE TABLE `lichhoc` (
  `ID` int(11) NOT NULL,
  `MaLHP` varchar(10) NOT NULL,
  `Thu` tinyint(4) NOT NULL,
  `TietBatDau` tinyint(4) NOT NULL,
  `TietKetThuc` tinyint(4) NOT NULL,
  `MaPhong` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `lichhoc`
--

INSERT INTO `lichhoc` (`ID`, `MaLHP`, `Thu`, `TietBatDau`, `TietKetThuc`, `MaPhong`) VALUES
(2, 'LWEB01', 2, 4, 5, 'A101'),
(3, 'LWEB02', 3, 4, 6, 'A101'),
(4, 'CSDL01', 4, 1, 3, 'B303'),
(5, 'DSA01', 6, 3, 5, 'A202'),
(7, 'CSDL_241_0', 3, 4, 6, 'A202'),
(8, 'LWEB03', 3, 4, 6, 'A101'),
(9, 'DSA_241_01', 4, 7, 9, 'B303'),
(10, 'TKPM_241_0', 5, 1, 3, 'A101');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lichthi`
--

CREATE TABLE `lichthi` (
  `ID` int(11) NOT NULL,
  `HocKy` varchar(20) NOT NULL,
  `MonThi` varchar(255) NOT NULL,
  `NgayThi` date NOT NULL,
  `PhongThi` varchar(50) NOT NULL,
  `CaThi` varchar(50) NOT NULL,
  `GiamThi` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `lichthi`
--

INSERT INTO `lichthi` (`ID`, `HocKy`, `MonThi`, `NgayThi`, `PhongThi`, `CaThi`, `GiamThi`) VALUES
(1, '2021HK02', 'Cấu trúc dữ liệu & giải thuật', '2025-12-14', 'B303', 'Ca sáng (7h30)', 'GV003'),
(2, '2021HK02', 'Nhập môn An toàn thông tin', '2025-12-15', 'A101', 'Ca chiều (13h30)', 'GV001'),
(3, '2024HK01', 'Khoa học dữ liệu cơ bản', '2025-12-27', 'A202', '3-5', 'GV002'),
(4, '2024HK01', 'Thiết kế phần mềm', '2025-12-20', 'B303', 'Ca chiều (13h30)', 'GV003'),
(5, '2024HK02', 'Machine Learning cơ bản', '2025-12-22', 'A101', 'Ca sáng (7h30)', 'GV001'),
(6, '2024HK02', 'Phân tích dữ liệu', '2025-12-24', 'A202', 'Ca chiều (13h30)', 'GV002'),
(7, '2025HK02', 'Cơ sở dữ liệu', '2025-12-16', 'A202', '1-2', 'GV002'),
(8, '2024HK01', 'Lập trình web', '2025-12-12', 'A203', '3-5', 'GV001'),
(9, '2025HK01', 'Lập trình Web', '2025-12-12', 'B303', '1-2', 'GV002');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lophocphan`
--

CREATE TABLE `lophocphan` (
  `MaLHP` varchar(10) NOT NULL,
  `MaMH` varchar(10) NOT NULL,
  `MaHK` varchar(10) NOT NULL,
  `MaGV` varchar(10) DEFAULT NULL,
  `SiSoToiDa` int(11) NOT NULL,
  `SiSoHienTai` int(11) DEFAULT 0,
  `TrangThai` enum('DangMo','Dong','Huy') DEFAULT 'DangMo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `lophocphan`
--

INSERT INTO `lophocphan` (`MaLHP`, `MaMH`, `MaHK`, `MaGV`, `SiSoToiDa`, `SiSoHienTai`, `TrangThai`) VALUES
('CSDL01', 'CSDL', '2024HK01', 'GV001', 50, 39, 'DangMo'),
('CSDL_241_0', 'CSDL', '2024HK01', 'GV001', 50, 0, 'DangMo'),
('DSA01', 'DSA', '2024HK02', 'GV002', 55, 34, 'DangMo'),
('DSA_241_01', 'DSA', '2024HK01', 'GV003', 45, 0, 'DangMo'),
('LWEB01', 'MLCB', '2024HK01', 'GV001', 60, 31, 'DangMo'),
('LWEB02', 'LTWEB', '2024HK01', 'GV002', 50, 42, 'DangMo'),
('LWEB03', 'LTWEB', '2024HK01', 'GV002', 50, 0, 'DangMo'),
('TKPM_241_0', 'TKPM', '2024HK01', 'GV002', 60, 0, 'DangMo');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `monhoc`
--

CREATE TABLE `monhoc` (
  `MaMH` varchar(10) NOT NULL,
  `TenMH` varchar(200) NOT NULL,
  `SoTC` int(11) NOT NULL,
  `LoaiMon` enum('BatBuoc','TuChon') DEFAULT 'BatBuoc',
  `HocPhiTC` decimal(10,0) DEFAULT 0,
  `MoTa` text DEFAULT NULL,
  `MaNganh` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `monhoc`
--

INSERT INTO `monhoc` (`MaMH`, `TenMH`, `SoTC`, `LoaiMon`, `HocPhiTC`, `MoTa`, `MaNganh`) VALUES
('ATTT1', 'Nhập môn An toàn thông tin', 3, 'BatBuoc', 350000, NULL, 'ATTT'),
('CSDL', 'Cơ sở dữ liệu', 3, 'BatBuoc', 350000, NULL, 'KHDL'),
('DSA', 'Cấu trúc dữ liệu & giải thuật', 4, 'BatBuoc', 350000, NULL, 'CNPM'),
('KHDLCB', 'Khoa học dữ liệu cơ bản', 3, 'BatBuoc', 350000, NULL, 'KHDL'),
('LTWEB', 'Lập trình Web', 3, 'BatBuoc', 350000, NULL, 'CNPM'),
('MLCB', 'Machine Learning cơ bản', 3, 'BatBuoc', 350000, NULL, 'KHDL'),
('PTDL', 'Phân tích dữ liệu', 3, 'BatBuoc', 350000, NULL, 'KHDL'),
('TKPM', 'Thiết kế phần mềm', 3, 'BatBuoc', 350000, NULL, 'CNPM');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `monhoc_nganh`
--

CREATE TABLE `monhoc_nganh` (
  `MaNganh` varchar(10) NOT NULL,
  `MaMH` varchar(10) NOT NULL,
  `NamKienNghi` smallint(6) DEFAULT NULL,
  `HKienNghi` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `monhoc_nganh`
--

INSERT INTO `monhoc_nganh` (`MaNganh`, `MaMH`, `NamKienNghi`, `HKienNghi`) VALUES
('ATTT', 'ATTT1', 2, 1),
('ATTT', 'CSDL', 1, 1),
('ATTT', 'DSA', 1, 2),
('CNPM', 'CSDL', 1, 2),
('CNPM', 'DSA', 1, 1),
('CNPM', 'LTWEB', 2, 1),
('CNPM', 'TKPM', 2, 2),
('KHDL', 'CSDL', 1, 1),
('KHDL', 'DSA', 1, 2),
('KHDL', 'KHDLCB', 1, 1),
('KHDL', 'MLCB', 2, 1),
('KHDL', 'PTDL', 2, 2);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `monhoc_tienquyet`
--

CREATE TABLE `monhoc_tienquyet` (
  `MaMH` varchar(10) NOT NULL,
  `MaMHTienQ` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `namhoc`
--

CREATE TABLE `namhoc` (
  `MaNamHoc` varchar(9) NOT NULL,
  `MoTa` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `namhoc`
--

INSERT INTO `namhoc` (`MaNamHoc`, `MoTa`) VALUES
('2021-2022', 'Năm học 2021 - 2022'),
('2022-2023', 'Năm học 2022 - 2023'),
('2024-2025', 'Năm học 2024 - 2025'),
('2025-2026', 'Năm học 2025 - 2026');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nganh`
--

CREATE TABLE `nganh` (
  `MaNganh` varchar(10) NOT NULL,
  `TenNganh` varchar(150) NOT NULL,
  `MaKhoa` varchar(10) NOT NULL,
  `TrangThai` enum('Active','Inactive') DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `nganh`
--

INSERT INTO `nganh` (`MaNganh`, `TenNganh`, `MaKhoa`, `TrangThai`) VALUES
('ATTT', 'An toàn thông tin', 'ATTT', 'Active'),
('CNPM', 'Công nghệ phần mềm', 'CNTT', 'Active'),
('KHDL', 'Khoa học dữ liệu', 'CNTT', 'Active'),
('KTTT_KT', 'Kiểm toán chất lượng cao', 'KTKT', 'Active'),
('SPA', 'Sư phạm Anh', 'SP', 'Active');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nhatkydiem`
--

CREATE TABLE `nhatkydiem` (
  `ID` int(11) NOT NULL,
  `BangDiemID` int(11) NOT NULL,
  `ThoiGian` datetime DEFAULT current_timestamp(),
  `NguoiSua` varchar(50) DEFAULT NULL,
  `NoiDung` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `phonghoc`
--

CREATE TABLE `phonghoc` (
  `MaPhong` varchar(10) NOT NULL,
  `TenPhong` varchar(50) NOT NULL,
  `SucChua` int(11) DEFAULT NULL,
  `CoSo` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `phonghoc`
--

INSERT INTO `phonghoc` (`MaPhong`, `TenPhong`, `SucChua`, `CoSo`) VALUES
('A101', 'Phòng A101', 60, 'CS1'),
('A202', 'Phòng A202', 50, 'CS1'),
('B303', 'Phòng B303', 45, 'CS2');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sinhvien`
--

CREATE TABLE `sinhvien` (
  `MaSV` varchar(12) NOT NULL,
  `HoTen` varchar(100) NOT NULL,
  `NgaySinh` date DEFAULT NULL,
  `GioiTinh` enum('Nam','Nu','Khac') DEFAULT NULL,
  `Email` varchar(150) DEFAULT NULL,
  `SoDT` varchar(20) DEFAULT NULL,
  `DiaChi` varchar(255) DEFAULT NULL,
  `MaNganh` varchar(10) NOT NULL,
  `Lop` varchar(20) DEFAULT NULL,
  `KhoaHoc` smallint(6) DEFAULT NULL,
  `TrangThai` enum('DangHoc','TotNghiep','BaoLuu','ThoiHoc') DEFAULT 'DangHoc'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `sinhvien`
--

INSERT INTO `sinhvien` (`MaSV`, `HoTen`, `NgaySinh`, `GioiTinh`, `Email`, `SoDT`, `DiaChi`, `MaNganh`, `Lop`, `KhoaHoc`, `TrangThai`) VALUES
('440001', 'Nguyễn Văn An', '2004-01-12', 'Nam', 'an440001@gmail.com', NULL, NULL, 'CNPM', '44CNTT1', 44, 'DangHoc'),
('440002', 'Trần Thị Hoa', '2004-02-25', 'Nu', 'hoa440002@gmail.com', NULL, NULL, 'CNPM', '44CNTT1', 44, 'DangHoc'),
('440003', 'Lê Minh Tuấn', '2004-03-10', 'Nam', 'tuan440003@gmail.com', NULL, NULL, 'KHDL', '44KHDL1', 44, 'DangHoc'),
('440004', 'Huyền Trinh', '2004-04-08', 'Nu', 'yen440004@gmail.com', NULL, NULL, 'ATTT', '44ATTT1', 44, 'DangHoc');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `taikhoan`
--

CREATE TABLE `taikhoan` (
  `Username` varchar(50) NOT NULL,
  `MatKhauHash` varchar(255) NOT NULL,
  `VaiTro` enum('Admin','GiangVien','SinhVien') NOT NULL,
  `MaSV` varchar(12) DEFAULT NULL,
  `MaGV` varchar(10) DEFAULT NULL,
  `TrangThai` enum('Active','Locked') DEFAULT 'Active',
  `LanDangNhapCuoi` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `taikhoan`
--

INSERT INTO `taikhoan` (`Username`, `MatKhauHash`, `VaiTro`, `MaSV`, `MaGV`, `TrangThai`, `LanDangNhapCuoi`) VALUES
('440001', '$2b$10$/teMcui1eudCZzH4jrcuh.eBUJ0p3gDVtPWCFShK1AlEC1DqMQypG', 'SinhVien', '440001', NULL, 'Locked', NULL),
('440002', '$2b$10$AY4pgC.nYhxudTxE6J4RC.Ul/qlspZx9wD275u6EJ8UsCd0a37XNG', 'SinhVien', '440002', NULL, 'Active', NULL),
('440003', '$2b$10$X6RcSPCyACkE2pekqaVm2edP4JTFd/m/LVi.kW3/.Nl93eIHmvXAS', 'SinhVien', '440003', NULL, 'Active', NULL),
('440004', '$2b$10$xkK/m9T3WPlRxOUqtbS8oueWDR9AEgOZ5uj96cxsYKFiIVv6L/txK', 'SinhVien', '440004', NULL, 'Active', NULL),
('admin', '$2b$10$elVAhOI8UiS/2x2IHiPbMO/pd/UtQaNvoBNKZ5UurIS6d3cXcoO6.', 'Admin', NULL, NULL, 'Active', NULL),
('GV001', '$2b$10$UvS3LlKwXOgmuh61gjwu3ujjG3zlzJ7bGJt5qZI86Y/Wv/AFcKUES', 'GiangVien', NULL, 'GV001', 'Active', NULL),
('GV002', '$2b$10$xUffYVi7pfSzagPj9NGFgOruQTKGx51IVWmAZtWi2D6IQSmbpCHpS', 'GiangVien', NULL, 'GV002', 'Active', NULL),
('GV010', '$2b$10$NewrspSTc1RyV955Fa1EPueIGWBG2CtkKz67zKp7DvM9DmbCy7oTm', 'GiangVien', NULL, 'GV010', 'Active', NULL),
('GV011', '$2b$10$meHLwG/9DbxL1q5XZlRl2uboGj3pUMVJXP6aotVZ48Ru7bBIDx3vu', 'GiangVien', NULL, 'GV011', 'Active', NULL),
('Trinh', '$2b$10$8YeZaM0ayj/Rks1Jpp9kiu0PUYab9y6EeAgENre//yUdisJj3ay6a', 'Admin', NULL, NULL, 'Active', NULL);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `bangdiem`
--
ALTER TABLE `bangdiem`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `FK_bd_dk` (`DangKyID`);

--
-- Chỉ mục cho bảng `dangkyhocphan`
--
ALTER TABLE `dangkyhocphan`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `FK_dk_sv` (`MaSV`),
  ADD KEY `FK_dk_lhp` (`MaLHP`),
  ADD KEY `FK_dk_hk` (`MaHK`);

--
-- Chỉ mục cho bảng `dotdangky`
--
ALTER TABLE `dotdangky`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `FK_dot_hk` (`MaHK`);

--
-- Chỉ mục cho bảng `giangvien`
--
ALTER TABLE `giangvien`
  ADD PRIMARY KEY (`MaGV`);

--
-- Chỉ mục cho bảng `hocky`
--
ALTER TABLE `hocky`
  ADD PRIMARY KEY (`MaHK`),
  ADD KEY `FK_hk_namhoc` (`MaNamHoc`);

--
-- Chỉ mục cho bảng `khoa`
--
ALTER TABLE `khoa`
  ADD PRIMARY KEY (`MaKhoa`);

--
-- Chỉ mục cho bảng `lichhoc`
--
ALTER TABLE `lichhoc`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `FK_lich_lhp` (`MaLHP`),
  ADD KEY `FK_lich_phong` (`MaPhong`);

--
-- Chỉ mục cho bảng `lichthi`
--
ALTER TABLE `lichthi`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `uq_lichthi` (`NgayThi`,`PhongThi`,`CaThi`);

--
-- Chỉ mục cho bảng `lophocphan`
--
ALTER TABLE `lophocphan`
  ADD PRIMARY KEY (`MaLHP`),
  ADD KEY `FK_lhp_mh` (`MaMH`),
  ADD KEY `FK_lhp_hk` (`MaHK`),
  ADD KEY `FK_lhp_gv` (`MaGV`);

--
-- Chỉ mục cho bảng `monhoc`
--
ALTER TABLE `monhoc`
  ADD PRIMARY KEY (`MaMH`),
  ADD KEY `fk_monhoc_nganh` (`MaNganh`);

--
-- Chỉ mục cho bảng `monhoc_nganh`
--
ALTER TABLE `monhoc_nganh`
  ADD PRIMARY KEY (`MaNganh`,`MaMH`),
  ADD KEY `FK_mn_monhoc` (`MaMH`);

--
-- Chỉ mục cho bảng `monhoc_tienquyet`
--
ALTER TABLE `monhoc_tienquyet`
  ADD PRIMARY KEY (`MaMH`,`MaMHTienQ`),
  ADD KEY `FK_mhtq2` (`MaMHTienQ`);

--
-- Chỉ mục cho bảng `namhoc`
--
ALTER TABLE `namhoc`
  ADD PRIMARY KEY (`MaNamHoc`);

--
-- Chỉ mục cho bảng `nganh`
--
ALTER TABLE `nganh`
  ADD PRIMARY KEY (`MaNganh`),
  ADD KEY `FK_nganh_khoa` (`MaKhoa`);

--
-- Chỉ mục cho bảng `nhatkydiem`
--
ALTER TABLE `nhatkydiem`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `FK_nk_bd` (`BangDiemID`);

--
-- Chỉ mục cho bảng `phonghoc`
--
ALTER TABLE `phonghoc`
  ADD PRIMARY KEY (`MaPhong`);

--
-- Chỉ mục cho bảng `sinhvien`
--
ALTER TABLE `sinhvien`
  ADD PRIMARY KEY (`MaSV`),
  ADD KEY `FK_sv_nganh` (`MaNganh`);

--
-- Chỉ mục cho bảng `taikhoan`
--
ALTER TABLE `taikhoan`
  ADD PRIMARY KEY (`Username`),
  ADD KEY `FK_tk_sv` (`MaSV`),
  ADD KEY `FK_tk_gv` (`MaGV`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `bangdiem`
--
ALTER TABLE `bangdiem`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `dangkyhocphan`
--
ALTER TABLE `dangkyhocphan`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT cho bảng `dotdangky`
--
ALTER TABLE `dotdangky`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `lichhoc`
--
ALTER TABLE `lichhoc`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `lichthi`
--
ALTER TABLE `lichthi`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `nhatkydiem`
--
ALTER TABLE `nhatkydiem`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `bangdiem`
--
ALTER TABLE `bangdiem`
  ADD CONSTRAINT `FK_bd_dk` FOREIGN KEY (`DangKyID`) REFERENCES `dangkyhocphan` (`ID`);

--
-- Các ràng buộc cho bảng `dangkyhocphan`
--
ALTER TABLE `dangkyhocphan`
  ADD CONSTRAINT `FK_dk_hk` FOREIGN KEY (`MaHK`) REFERENCES `hocky` (`MaHK`),
  ADD CONSTRAINT `FK_dk_lhp` FOREIGN KEY (`MaLHP`) REFERENCES `lophocphan` (`MaLHP`),
  ADD CONSTRAINT `FK_dk_sv` FOREIGN KEY (`MaSV`) REFERENCES `sinhvien` (`MaSV`);

--
-- Các ràng buộc cho bảng `dotdangky`
--
ALTER TABLE `dotdangky`
  ADD CONSTRAINT `FK_dot_hk` FOREIGN KEY (`MaHK`) REFERENCES `hocky` (`MaHK`);

--
-- Các ràng buộc cho bảng `hocky`
--
ALTER TABLE `hocky`
  ADD CONSTRAINT `FK_hk_namhoc` FOREIGN KEY (`MaNamHoc`) REFERENCES `namhoc` (`MaNamHoc`);

--
-- Các ràng buộc cho bảng `lichhoc`
--
ALTER TABLE `lichhoc`
  ADD CONSTRAINT `FK_lich_lhp` FOREIGN KEY (`MaLHP`) REFERENCES `lophocphan` (`MaLHP`),
  ADD CONSTRAINT `FK_lich_phong` FOREIGN KEY (`MaPhong`) REFERENCES `phonghoc` (`MaPhong`);

--
-- Các ràng buộc cho bảng `lophocphan`
--
ALTER TABLE `lophocphan`
  ADD CONSTRAINT `FK_lhp_gv` FOREIGN KEY (`MaGV`) REFERENCES `giangvien` (`MaGV`),
  ADD CONSTRAINT `FK_lhp_hk` FOREIGN KEY (`MaHK`) REFERENCES `hocky` (`MaHK`),
  ADD CONSTRAINT `FK_lhp_mh` FOREIGN KEY (`MaMH`) REFERENCES `monhoc` (`MaMH`);

--
-- Các ràng buộc cho bảng `monhoc`
--
ALTER TABLE `monhoc`
  ADD CONSTRAINT `fk_monhoc_nganh` FOREIGN KEY (`MaNganh`) REFERENCES `nganh` (`MaNganh`);

--
-- Các ràng buộc cho bảng `monhoc_nganh`
--
ALTER TABLE `monhoc_nganh`
  ADD CONSTRAINT `FK_mn_monhoc` FOREIGN KEY (`MaMH`) REFERENCES `monhoc` (`MaMH`),
  ADD CONSTRAINT `FK_mn_nganh` FOREIGN KEY (`MaNganh`) REFERENCES `nganh` (`MaNganh`);

--
-- Các ràng buộc cho bảng `monhoc_tienquyet`
--
ALTER TABLE `monhoc_tienquyet`
  ADD CONSTRAINT `FK_mhtq1` FOREIGN KEY (`MaMH`) REFERENCES `monhoc` (`MaMH`),
  ADD CONSTRAINT `FK_mhtq2` FOREIGN KEY (`MaMHTienQ`) REFERENCES `monhoc` (`MaMH`);

--
-- Các ràng buộc cho bảng `nganh`
--
ALTER TABLE `nganh`
  ADD CONSTRAINT `FK_nganh_khoa` FOREIGN KEY (`MaKhoa`) REFERENCES `khoa` (`MaKhoa`);

--
-- Các ràng buộc cho bảng `nhatkydiem`
--
ALTER TABLE `nhatkydiem`
  ADD CONSTRAINT `FK_nk_bd` FOREIGN KEY (`BangDiemID`) REFERENCES `bangdiem` (`ID`);

--
-- Các ràng buộc cho bảng `sinhvien`
--
ALTER TABLE `sinhvien`
  ADD CONSTRAINT `FK_sv_nganh` FOREIGN KEY (`MaNganh`) REFERENCES `nganh` (`MaNganh`);

--
-- Các ràng buộc cho bảng `taikhoan`
--
ALTER TABLE `taikhoan`
  ADD CONSTRAINT `FK_tk_gv` FOREIGN KEY (`MaGV`) REFERENCES `giangvien` (`MaGV`),
  ADD CONSTRAINT `FK_tk_sv` FOREIGN KEY (`MaSV`) REFERENCES `sinhvien` (`MaSV`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
