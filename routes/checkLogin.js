function checkLogin(req, res, next) {
    if (!req.session.user) {
      req.flash('error', '未登入');
      return res.redirect('/login');
    }
    next();
  }

  module.exports = checkLogin;