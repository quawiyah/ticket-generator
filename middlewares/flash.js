const flash = (req, res, next) => {
  req.flash = (type, message) => {
    if (!req.session) return; // Prevent crashing after logout
    req.session.flash = { type, message };
  };

  res.back = () => {
    res.redirect(req.headers.referer || '/');
  };

  // Provide data to views
  res.locals.flash = req.session.flash || null;
  res.locals.errors = req.session.errors || {};
  res.locals.old = req.session.old || null;
  res.locals.admin = req?.session?.admin || null;

  // Clear after response finishes
  if (req.session) {
    delete req.session.flash;
    delete req.session.errors;
    delete req.session.old;
  }

  next();
};


module.exports = flash;