var authController = require('../controllers/authcontroller.js');
// var express = require('express');
// var router = express.Router();

module.exports = function(app, passport) {
 
    app.get('/signup', authController.signup);
    app.get('/signin', authController.signin);
    app.get('/login', authController.login);
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/dashboard',
        failureRedirect: '/1'
    }
    ));
    app.get('/dashboard',authController.dashboard);
}


// router.get('/', authController.signup);
// module.exports = router;
