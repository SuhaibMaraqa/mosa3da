module.exports = (req, res, next) => {
    if(req.user.role !== 'customer') {
        return res.redirect('/dashboard');
    } else {
    }
    next();
}