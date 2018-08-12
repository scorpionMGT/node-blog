const express = require("express");
const router = express.Router();

const flash = require("connect-flash");
const session = require("express-session");

router.use(flash());
const checkLogin = require("./checkLogin");

// 用户退出登录的路由
router.get('/logout', checkLogin);
router.get("/logout", (req, res, next) => {
    req.session.user = null;
    req.flash('success', '退出成功');
    res.redirect('/');
});

module.exports = router;