const express = require("express");
const router = express.Router();
const flash = require("connect-flash");
const session = require("express-session");
const User = require('../models/user');
const Post = require("../models/post");
router.use(flash());
const checkLogin = require("./checkLogin");

router.get("/post", checkLogin)
router.get("/post", (req, res, next) => {
    res.redirect(`/u/${req.session.user}`);
})

router.post('/post', checkLogin);
router.post('/post', function (req, res) {
    let currentUser = req.session.user;
    let post = new Post(currentUser.name, req.body.post);
    post.save(function (err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        req.flash('success', '发表成功');
        res.redirect('/u/' + currentUser.name);
    });
});

router.get('/u/:user', (req, res) => {
    User.get(req.params.user, (err, user) => {
        if (!user) {
            req.flash('error', '用户不存在');
            return res.redirect('/');
        }
        Post.get(user.name, (err, posts) => {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('user', {
                title: user.name,
                posts: posts,
            });
        });
    });
});

module.exports = router;