module.exports = function (req, res, next) {
    if (!req.session.giangvien) {
        return res.redirect("/");   // quay lại login
    }
    next();
};
