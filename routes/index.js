var express = require('express');
var router = express.Router();
//var ObjectId = require('mongodb').ObjectID;

/* GET home page. */

router.get('/', function(req, res, next) {
  console.log("Hello CarTrust");
  res.render('index', { title: 'CarTrust' });
});

exports.index = function(req, res){
  res.render('index', { title: 'CarTrust' });
};

module.exports = router;

