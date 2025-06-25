const authenticate = (req, res, next) => {
    if (!req.session?.admin){
        req.flash('You need to login to access admin routes', 'error')
        return res.redirect('/login')
    }
    next();
}

module.exports = authenticate;