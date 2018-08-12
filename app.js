const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const crypto = require("crypto-browserify");
const session = require("express-session");
const MongoStore = require('connect-mongo')(session);
const flash = require("connect-flash");
const util = require("util");

const setting = require('./setting');
const User = require('./models/user');
const Post = require('./models/post');
const index = require('./routes/index');
const reg = require("./routes/reg");
const login = require("./routes/login");
const logout = require("./routes/logout");
const post = require("./routes/post");
const helper = require("./routes/helper");
const error = require("./routes/error");
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set("views options", {
  layout: true,
});
app.set("views options", (req, res, next) => {
  res.render("/admin", {
    title: '用户列表后台管理系统',
    layout: "admin",
  })
  next();
});

app.use(flash());
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: setting.cookieSecret,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    url: 'mongodb://localhost/mgt360124',
    ttl: 365 * 24 * 60 * 60,// = 365 days.
    autoRemove: 'native',
    db: setting.db
  })
}));
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  let err = req.flash('error');
  let success = req.flash('success');
  res.locals.error = err.length ? err : null;
  res.locals.success = success.length ? success : null;
  next();
});


//微博页面的路由规则
// 博客首页路由
app.use(index);
//注册页路由
app.use(reg);
//登录页路由
app.use(login);
//退出页路由
app.use(logout);
//发表留言页的路由
app.use(post);
//帮助页的路由
app.use(helper)
// 错误处理页的路由
app.use(error);

module.exports = app;
