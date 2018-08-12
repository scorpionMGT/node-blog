const express = require('express');
const router = express.Router();
const flash = require("connect-flash");
const session = require("express-session");
const partials = require('express-partials');
const Post = require("../models/post");
router.use(partials());
/* GET home page. */

router.get('/', (req, res) => {
  Post.get(null, (err, posts) => {
    if (err) {
      posts = [];
    }
    res.render('index', {
      title: '首页',
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

module.exports = router;
