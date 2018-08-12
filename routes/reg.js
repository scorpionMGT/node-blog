const express = require("express");
const router = express.Router();
const crypto = require("crypto-browserify");
const flash = require("connect-flash");
const session = require("express-session");
const User = require('../models/user');

router.use(flash());
const checkNotLogin = require("./checkNotLogin");
const checkLogin = require("./checkLogin");
router.get('/reg', checkNotLogin);
router.get("/reg", (req, res, next) => {
    res.render("reg", { title: "注册页面" });

});

router.post('/reg', checkNotLogin);
router.post("/reg", (req, res, next) => {
    //检验用户两次输入的口令是否一致
    if (req.body['password-repeat'] != req.body['password']) {
        let error = req.flash('error', '两次输入的口令不一致');
        return res.redirect('/reg');
    }
    //生成口令的散列值
    const md5 = crypto.createHash('md5');
    const password = md5.update(req.body.password).digest('base64');
    const newUser = new User({
        name: req.body.username,
        password: password,
    });
    //检查用户名是否已经存在
    User.get(newUser.name, (err, user) => {
        if (user) err = '用户已经存在!';
        if (err) {
            req.flash('error', err);
            return res.redirect('/reg');
        }
        //如果不存在则新增用户
        newUser.save((err) => {
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }
            req.session.user = newUser;
            req.flash('success', '注册成功');
            res.redirect('/');
        });
    });
});

module.exports = router;