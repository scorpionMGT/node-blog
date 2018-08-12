const express = require("express");
const router = express.Router();
const crypto = require("crypto-browserify");
const flash = require("connect-flash");
const session = require("express-session");
const User = require('../models/user');

router.use(flash());
const checkNotLogin = require("./checkNotLogin");
// 用户登录页的路由
router.get('/login', checkNotLogin);
router.get("/login", (req, res, next) => {
    res.render('login', {
        title: '用户登入',
    });
});

router.post('/login', checkNotLogin);
router.post("/login", (req, res, next) => {
    //生成口令的散列值
    const md5 = crypto.createHash('md5');
    const password = md5.update(req.body.password).digest('base64');
    User.get(req.body.username, (err, user) => {
        if (!user) {
            req.flash('error', '用户不存在');
            return res.redirect('/login');
        }
        if (user.password != password) {
            req.flash('error', '用户口令错误');
            return res.redirect('/login');
        }
        req.session.user = user;
        req.flash('success', '登入成功');
        res.redirect('/');
    });
});

module.exports = router;