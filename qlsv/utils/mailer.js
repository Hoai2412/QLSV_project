const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "qlsvqnu.system@gmail.com",      // mail hệ thống
        pass: "dxld bczc wslh senh"      // app password
    }
});

exports.sendOTP = async (to, otp) => {
    await transporter.sendMail({
        from: "QLSV System <qlsvqnu.system@gmail.com>",
        to,
        subject: "Mã OTP đặt lại mật khẩu",
        html: `
            <p>Mã OTP của bạn là:</p>
            <h2 style="color:blue">${otp}</h2>
            <p>Mã có hiệu lực trong 5 phút.</p>
        `
    });
};
