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
const partials = require('express-partials');
const util = require("util");

const setting = require('./setting');
const User = require('./models/user');
const Post = require('./models/post');
const index = require('./routes/index');
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


app.use(partials());
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

// app.use('/', index);
app.get('/', function (req, res) {
  Post.get(null, function (err, posts) {
    if (err) {
        posts = [];
    }
    res.render('index', {
      title: '首页',
      posts: posts,
      user : req.session.user,
			success : req.flash('success').toString(),
			error : req.flash('error').toString()
    });
  });
});

app.get("/helper", (req, res) => {
  res.render("helper", {
    title: "Helpers",
  })
});

//微博页面的路由规则

//注册页路由
app.get('/reg', checkNotLogin);
app.get("/reg", (req, res, next) => {
  res.render("reg", { title: "注册页面" });

});

app.post('/reg', checkNotLogin);
app.post("/reg", (req, res, next) => {
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


// 用户登录页的路由
app.get('/login', checkNotLogin);
app.get("/login", (req, res, next) => {
  res.render('login', {
    title: '用户登入',
  });
});

app.post('/login', checkNotLogin);
app.post("/login", (req, res, next) => {
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

// 用户退出登录的路由
app.get('/logout', checkLogin);
app.get("/logout", (req, res, next) => {
  req.session.user = null;
  req.flash('success', '退出成功');
  res.redirect('/');
});


app.get('/u/:user', (req, res) => {
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


// 用户发表博客的路由
app.get("/post", checkLogin)
app.get("/post", (req, res, next) => {
  res.redirect(`/u/${req.session.user}`);
})

app.post('/post', checkLogin);
app.post('/post', function (req, res) {
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


function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', '未登入');
    return res.redirect('/login');
  }
  next();
}
function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', '已登入');
    return res.redirect('/');
  }
  next();
}


// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
