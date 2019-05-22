var exports = module.exports = {}
 

exports.signup = function(req, res) {
    console.log("Signup Page");
    res.render('signup');
}

exports.signin = function(req, res) {
    console.log("Signin page");
    res.render('signin');
}

exports.login = function(req, res) {
    console.log("Login Page");
    res.render('login');
}

exports.dashboard = function(req, res) {
    console.log("Dashboard page");
    res.render('dashboard');
}