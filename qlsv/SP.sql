DELIMITER $$

CREATE PROCEDURE sp_DangKyHocPhan(
    IN p_MaSV  VARCHAR(12),
    IN p_MaLHP VARCHAR(12),
    IN p_GhiChu TEXT
)
BEGIN
    DECLARE v_exists INT DEFAULT 0;

    -- 1. Kiểm tra đã đăng ký chưa
    SELECT COUNT(*) INTO v_exists
    FROM DangKyHocPhan
    WHERE MaSV = p_MaSV
      AND MaLHP = p_MaLHP
      AND TrangThai = 'A';

    IF v_exists > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Đã đăng ký lớp này rồi';
    END IF;

    -- 2. Thêm đăng ký mới
    INSERT INTO DangKyHocPhan (MaSV, MaLHP, TrangThai, GhiChu)
    VALUES (p_MaSV, p_MaLHP, 'A', p_GhiChu);

    -- 3. Cập nhật sĩ số
    UPDATE LopHocPhan
    SET SiSoHienTai = SiSoHienTai + 1
    WHERE MaLHP = p_MaLHP;
END$$

DELIMITER ;
