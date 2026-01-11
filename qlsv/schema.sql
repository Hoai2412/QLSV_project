-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 30, 2025 at 06:49 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `qlsv_monhoc`
--

-- --------------------------------------------------------

--
-- Table structure for table `bangdiem`
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
-- Dumping data for table `bangdiem`
--

INSERT INTO `bangdiem` (`ID`, `DangKyID`, `TyLeQT`, `TyLeCK`, `DiemQT`, `DiemCK`, `DiemTK10`, `DiemChu`, `KetQua`, `IsLocked`, `NgayKhoa`) VALUES
(1, 1, 0.40, 0.60, 7.50, 8.00, 7.80, 'B', 'Đạt', 0, NULL),
(2, 2, 0.40, 0.60, 8.00, 7.00, 7.40, 'B', 'Đạt', 0, NULL),
(3, 3, 0.40, 0.60, 6.50, 7.00, 6.80, 'C', 'Đạt', 0, NULL),
(4, 4, 0.40, 0.60, 7.00, 6.00, 6.40, 'C', 'Đạt', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `dangkyhocphan`
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
-- Dumping data for table `dangkyhocphan`
--

INSERT INTO `dangkyhocphan` (`ID`, `MaSV`, `MaLHP`, `MaHK`, `NgayDK`, `TrangThai`, `HocPhi`) VALUES
(1, '440001', 'LWEB01', '2021HK01', '2025-11-30 22:08:10', 'DaHuy', 1050000),
(2, '440001', 'CSDL01', '2021HK01', '2025-11-30 22:08:10', 'DaHuy', 1050000),
(3, '440002', 'LWEB02', '2021HK01', '2025-11-30 22:08:10', 'DaDangKy', 1050000),
(4, '440003', 'DSA01', '2021HK02', '2025-11-30 22:08:10', 'DaDangKy', 1400000),
(5, '440001', 'LWEB01', '2021HK01', '2025-11-30 22:41:08', 'DaHuy', 0),
(6, '440001', 'LWEB01', '2021HK01', '2025-11-30 22:41:08', 'DaHuy', 0),
(7, '440001', 'DSA01', '2021HK01', '2025-11-30 23:12:17', 'DaDangKy', 0);

-- --------------------------------------------------------

--
-- Table structure for table `giangvien`
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
-- Dumping data for table `giangvien`
--

INSERT INTO `giangvien` (`MaGV`, `HoTen`, `Email`, `SoDT`, `HocVi`, `BoMon`, `TrangThai`) VALUES
('GV001', 'Nguyễn Thanh Bình', 'binh@abc.edu.vn', '0912345678', 'ThS', 'CNTT', 'Active'),
('GV002', 'Lê Hồng Phúc', 'phuc@abc.edu.vn', '0911222333', 'ThS', 'CNTT', 'Active'),
('GV003', 'Võ Thùy Linh', 'linh@abc.edu.vn', '0988776655', 'TS', 'ATTT', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `hocky`
--

CREATE TABLE `hocky` (
  `MaHK` varchar(10) NOT NULL,
  `MaNamHoc` varchar(9) NOT NULL,
  `TenHK` varchar(50) NOT NULL,
  `ThuTu` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hocky`
--

INSERT INTO `hocky` (`MaHK`, `MaNamHoc`, `TenHK`, `ThuTu`) VALUES
('2021HK01', '2021-2022', 'HK01', 1),
('2021HK02', '2021-2022', 'HK02', 2),
('2022HK01', '2022-2023', 'HK01', 1),
('2022HK02', '2022-2023', 'HK02', 2);

-- --------------------------------------------------------

--
-- Table structure for table `khoa`
--

CREATE TABLE `khoa` (
  `MaKhoa` varchar(10) NOT NULL,
  `TenKhoa` varchar(100) NOT NULL,
  `MoTa` varchar(255) DEFAULT NULL,
  `TrangThai` enum('Active','Inactive') DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `khoa`
--

INSERT INTO `khoa` (`MaKhoa`, `TenKhoa`, `MoTa`, `TrangThai`) VALUES
('ATTT', 'An toàn thông tin', NULL, 'Active'),
('CNTT', 'Công nghệ thông tin', NULL, 'Active'),
('KTPM', 'Kỹ thuật phần mềm', NULL, 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `lichhoc`
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
-- Dumping data for table `lichhoc`
--

INSERT INTO `lichhoc` (`ID`, `MaLHP`, `Thu`, `TietBatDau`, `TietKetThuc`, `MaPhong`) VALUES
(1, 'LWEB01', 2, 1, 3, 'A101'),
(2, 'LWEB01', 5, 1, 3, 'A202'),
(3, 'LWEB02', 3, 4, 6, 'A101'),
(4, 'CSDL01', 4, 1, 3, 'B303'),
(5, 'DSA01', 6, 3, 5, 'A202');

-- --------------------------------------------------------

--
-- Table structure for table `lophocphan`
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
-- Dumping data for table `lophocphan`
--

INSERT INTO `lophocphan` (`MaLHP`, `MaMH`, `MaHK`, `MaGV`, `SiSoToiDa`, `SiSoHienTai`, `TrangThai`) VALUES
('CSDL01', 'CSDL', '2021HK01', 'GV001', 50, 38, 'DangMo'),
('DSA01', 'DSA', '2021HK02', 'GV002', 55, 33, 'DangMo'),
('LWEB01', 'LTWEB', '2021HK01', 'GV001', 60, 30, 'DangMo'),
('LWEB02', 'LTWEB', '2021HK01', 'GV002', 60, 42, 'DangMo');

-- --------------------------------------------------------

--
-- Table structure for table `monhoc`
--

CREATE TABLE `monhoc` (
  `MaMH` varchar(10) NOT NULL,
  `TenMH` varchar(200) NOT NULL,
  `SoTC` int(11) NOT NULL,
  `LoaiMon` enum('BatBuoc','TuChon') DEFAULT 'BatBuoc',
  `HocPhiTC` decimal(10,0) DEFAULT 0,
  `MoTa` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `monhoc`
--

INSERT INTO `monhoc` (`MaMH`, `TenMH`, `SoTC`, `LoaiMon`, `HocPhiTC`, `MoTa`) VALUES
('ATTT1', 'Nhập môn An toàn thông tin', 3, 'BatBuoc', 350000, NULL),
('CSDL', 'Cơ sở dữ liệu', 3, 'BatBuoc', 350000, NULL),
('DSA', 'Cấu trúc dữ liệu & giải thuật', 4, 'BatBuoc', 350000, NULL),
('KHDLCB', 'Khoa học dữ liệu cơ bản', 3, 'BatBuoc', 350000, NULL),
('LTWEB', 'Lập trình Web', 3, 'BatBuoc', 350000, NULL),
('MLCB', 'Machine Learning cơ bản', 3, 'BatBuoc', 350000, NULL),
('PTDL', 'Phân tích dữ liệu', 3, 'BatBuoc', 350000, NULL),
('TKPM', 'Thiết kế phần mềm', 3, 'BatBuoc', 350000, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `monhoc_nganh`
--

CREATE TABLE `monhoc_nganh` (
  `MaNganh` varchar(10) NOT NULL,
  `MaMH` varchar(10) NOT NULL,
  `NamKienNghi` smallint(6) DEFAULT NULL,
  `HKienNghi` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `monhoc_nganh`
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
-- Table structure for table `monhoc_tienquyet`
--

CREATE TABLE `monhoc_tienquyet` (
  `MaMH` varchar(10) NOT NULL,
  `MaMHTienQ` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `namhoc`
--

CREATE TABLE `namhoc` (
  `MaNamHoc` varchar(9) NOT NULL,
  `MoTa` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `namhoc`
--

INSERT INTO `namhoc` (`MaNamHoc`, `MoTa`) VALUES
('2021-2022', 'Năm học 2021 - 2022'),
('2022-2023', 'Năm học 2022 - 2023');

-- --------------------------------------------------------

--
-- Table structure for table `nganh`
--

CREATE TABLE `nganh` (
  `MaNganh` varchar(10) NOT NULL,
  `TenNganh` varchar(150) NOT NULL,
  `MaKhoa` varchar(10) NOT NULL,
  `TrangThai` enum('Active','Inactive') DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nganh`
--

INSERT INTO `nganh` (`MaNganh`, `TenNganh`, `MaKhoa`, `TrangThai`) VALUES
('ATTT', 'An toàn thông tin', 'ATTT', 'Active'),
('CNPM', 'Công nghệ phần mềm', 'CNTT', 'Active'),
('KHDL', 'Khoa học dữ liệu', 'CNTT', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `nhatkydiem`
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
-- Table structure for table `phonghoc`
--

CREATE TABLE `phonghoc` (
  `MaPhong` varchar(10) NOT NULL,
  `TenPhong` varchar(50) NOT NULL,
  `SucChua` int(11) DEFAULT NULL,
  `CoSo` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `phonghoc`
--

INSERT INTO `phonghoc` (`MaPhong`, `TenPhong`, `SucChua`, `CoSo`) VALUES
('A101', 'Phòng A101', 60, 'CS1'),
('A202', 'Phòng A202', 50, 'CS1'),
('B303', 'Phòng B303', 45, 'CS2');

-- --------------------------------------------------------

--
-- Table structure for table `sinhvien`
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
-- Dumping data for table `sinhvien`
--

INSERT INTO `sinhvien` (`MaSV`, `HoTen`, `NgaySinh`, `GioiTinh`, `Email`, `SoDT`, `DiaChi`, `MaNganh`, `Lop`, `KhoaHoc`, `TrangThai`) VALUES
('440001', 'Nguyễn Văn An', '2004-01-12', 'Nam', 'an440001@gmail.com', NULL, NULL, 'CNPM', '44CNTT1', 44, 'DangHoc'),
('440002', 'Trần Thị Hoa', '2004-02-25', 'Nu', 'hoa440002@gmail.com', NULL, NULL, 'CNPM', '44CNTT1', 44, 'DangHoc'),
('440003', 'Lê Minh Tuấn', '2004-03-10', 'Nam', 'tuan440003@gmail.com', NULL, NULL, 'KHDL', '44KHDL1', 44, 'DangHoc'),
('440004', 'Phạm Hải Yến', '2004-04-08', 'Nu', 'yen440004@gmail.com', NULL, NULL, 'ATTT', '44ATTT1', 44, 'DangHoc');

-- --------------------------------------------------------

--
-- Table structure for table `taikhoan`
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
-- Dumping data for table `taikhoan`
--

INSERT INTO `taikhoan` (`Username`, `MatKhauHash`, `VaiTro`, `MaSV`, `MaGV`, `TrangThai`, `LanDangNhapCuoi`) VALUES
('440001', '123456hash', 'SinhVien', '440001', NULL, 'Active', NULL),
('440002', '123456hash', 'SinhVien', '440002', NULL, 'Active', NULL),
('440003', '123456hash', 'SinhVien', '440003', NULL, 'Active', NULL),
('admin', '123456hash', 'Admin', NULL, NULL, 'Active', NULL),
('GV001', '123456hash', 'GiangVien', NULL, NULL, 'Active', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bangdiem`
--
ALTER TABLE `bangdiem`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `FK_bd_dk` (`DangKyID`);

--
-- Indexes for table `dangkyhocphan`
--
ALTER TABLE `dangkyhocphan`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `FK_dk_sv` (`MaSV`),
  ADD KEY `FK_dk_lhp` (`MaLHP`),
  ADD KEY `FK_dk_hk` (`MaHK`);

--
-- Indexes for table `giangvien`
--
ALTER TABLE `giangvien`
  ADD PRIMARY KEY (`MaGV`);

--
-- Indexes for table `hocky`
--
ALTER TABLE `hocky`
  ADD PRIMARY KEY (`MaHK`),
  ADD KEY `FK_hk_namhoc` (`MaNamHoc`);

--
-- Indexes for table `khoa`
--
ALTER TABLE `khoa`
  ADD PRIMARY KEY (`MaKhoa`);

--
-- Indexes for table `lichhoc`
--
ALTER TABLE `lichhoc`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `FK_lich_lhp` (`MaLHP`),
  ADD KEY `FK_lich_phong` (`MaPhong`);

--
-- Indexes for table `lophocphan`
--
ALTER TABLE `lophocphan`
  ADD PRIMARY KEY (`MaLHP`),
  ADD KEY `FK_lhp_mh` (`MaMH`),
  ADD KEY `FK_lhp_hk` (`MaHK`),
  ADD KEY `FK_lhp_gv` (`MaGV`);

--
-- Indexes for table `monhoc`
--
ALTER TABLE `monhoc`
  ADD PRIMARY KEY (`MaMH`);

--
-- Indexes for table `monhoc_nganh`
--
ALTER TABLE `monhoc_nganh`
  ADD PRIMARY KEY (`MaNganh`,`MaMH`),
  ADD KEY `FK_mn_monhoc` (`MaMH`);

--
-- Indexes for table `monhoc_tienquyet`
--
ALTER TABLE `monhoc_tienquyet`
  ADD PRIMARY KEY (`MaMH`,`MaMHTienQ`),
  ADD KEY `FK_mhtq2` (`MaMHTienQ`);

--
-- Indexes for table `namhoc`
--
ALTER TABLE `namhoc`
  ADD PRIMARY KEY (`MaNamHoc`);

--
-- Indexes for table `nganh`
--
ALTER TABLE `nganh`
  ADD PRIMARY KEY (`MaNganh`),
  ADD KEY `FK_nganh_khoa` (`MaKhoa`);

--
-- Indexes for table `nhatkydiem`
--
ALTER TABLE `nhatkydiem`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `FK_nk_bd` (`BangDiemID`);

--
-- Indexes for table `phonghoc`
--
ALTER TABLE `phonghoc`
  ADD PRIMARY KEY (`MaPhong`);

--
-- Indexes for table `sinhvien`
--
ALTER TABLE `sinhvien`
  ADD PRIMARY KEY (`MaSV`),
  ADD KEY `FK_sv_nganh` (`MaNganh`);

--
-- Indexes for table `taikhoan`
--
ALTER TABLE `taikhoan`
  ADD PRIMARY KEY (`Username`),
  ADD KEY `FK_tk_sv` (`MaSV`),
  ADD KEY `FK_tk_gv` (`MaGV`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bangdiem`
--
ALTER TABLE `bangdiem`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `dangkyhocphan`
--
ALTER TABLE `dangkyhocphan`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `lichhoc`
--
ALTER TABLE `lichhoc`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `nhatkydiem`
--
ALTER TABLE `nhatkydiem`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bangdiem`
--
ALTER TABLE `bangdiem`
  ADD CONSTRAINT `FK_bd_dk` FOREIGN KEY (`DangKyID`) REFERENCES `dangkyhocphan` (`ID`);

--
-- Constraints for table `dangkyhocphan`
--
ALTER TABLE `dangkyhocphan`
  ADD CONSTRAINT `FK_dk_hk` FOREIGN KEY (`MaHK`) REFERENCES `hocky` (`MaHK`),
  ADD CONSTRAINT `FK_dk_lhp` FOREIGN KEY (`MaLHP`) REFERENCES `lophocphan` (`MaLHP`),
  ADD CONSTRAINT `FK_dk_sv` FOREIGN KEY (`MaSV`) REFERENCES `sinhvien` (`MaSV`);

--
-- Constraints for table `hocky`
--
ALTER TABLE `hocky`
  ADD CONSTRAINT `FK_hk_namhoc` FOREIGN KEY (`MaNamHoc`) REFERENCES `namhoc` (`MaNamHoc`);

--
-- Constraints for table `lichhoc`
--
ALTER TABLE `lichhoc`
  ADD CONSTRAINT `FK_lich_lhp` FOREIGN KEY (`MaLHP`) REFERENCES `lophocphan` (`MaLHP`),
  ADD CONSTRAINT `FK_lich_phong` FOREIGN KEY (`MaPhong`) REFERENCES `phonghoc` (`MaPhong`);

--
-- Constraints for table `lophocphan`
--
ALTER TABLE `lophocphan`
  ADD CONSTRAINT `FK_lhp_gv` FOREIGN KEY (`MaGV`) REFERENCES `giangvien` (`MaGV`),
  ADD CONSTRAINT `FK_lhp_hk` FOREIGN KEY (`MaHK`) REFERENCES `hocky` (`MaHK`),
  ADD CONSTRAINT `FK_lhp_mh` FOREIGN KEY (`MaMH`) REFERENCES `monhoc` (`MaMH`);

--
-- Constraints for table `monhoc_nganh`
--
ALTER TABLE `monhoc_nganh`
  ADD CONSTRAINT `FK_mn_monhoc` FOREIGN KEY (`MaMH`) REFERENCES `monhoc` (`MaMH`),
  ADD CONSTRAINT `FK_mn_nganh` FOREIGN KEY (`MaNganh`) REFERENCES `nganh` (`MaNganh`);

--
-- Constraints for table `monhoc_tienquyet`
--
ALTER TABLE `monhoc_tienquyet`
  ADD CONSTRAINT `FK_mhtq1` FOREIGN KEY (`MaMH`) REFERENCES `monhoc` (`MaMH`),
  ADD CONSTRAINT `FK_mhtq2` FOREIGN KEY (`MaMHTienQ`) REFERENCES `monhoc` (`MaMH`);

--
-- Constraints for table `nganh`
--
ALTER TABLE `nganh`
  ADD CONSTRAINT `FK_nganh_khoa` FOREIGN KEY (`MaKhoa`) REFERENCES `khoa` (`MaKhoa`);

--
-- Constraints for table `nhatkydiem`
--
ALTER TABLE `nhatkydiem`
  ADD CONSTRAINT `FK_nk_bd` FOREIGN KEY (`BangDiemID`) REFERENCES `bangdiem` (`ID`);

--
-- Constraints for table `sinhvien`
--
ALTER TABLE `sinhvien`
  ADD CONSTRAINT `FK_sv_nganh` FOREIGN KEY (`MaNganh`) REFERENCES `nganh` (`MaNganh`);

--
-- Constraints for table `taikhoan`
--
ALTER TABLE `taikhoan`
  ADD CONSTRAINT `FK_tk_gv` FOREIGN KEY (`MaGV`) REFERENCES `giangvien` (`MaGV`),
  ADD CONSTRAINT `FK_tk_sv` FOREIGN KEY (`MaSV`) REFERENCES `sinhvien` (`MaSV`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
