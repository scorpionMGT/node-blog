function checkNotLogin(req, res, next) {
    if (req.session.user) {
      req.flash('error', '已登入');
      return res.redirect('/');
    }
    next();
  }

  module.exports = checkNotLogin;
  