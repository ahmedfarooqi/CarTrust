var createError = require('http-errors');
var express = require('express');
var path = require('path');
var http = require('http');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var mongoose = require('mongoose');
var favicon = require('serve-favicon');
// var passport = require('passport');
var session = require('express-session');
var fs = require('fs');

var gis = require('g-i-s');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var distance = require('google-distance');
var app = express();
var dialog = require('dialog-node');
var router = express.Router();
//var routes = require('./routes/index');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');

var env = require('dotenv').config()
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
// var authRouter = require('./routes/auth')(app, passport);


// app.set('views', './views')
// app.engine('hbs', exphbs({
//     extname: '.hbs'
// }));
// app.set('view engine', '.hbs');

//Models
var PORT = process.env.PORT || 8000;
var db = require("./models");
// For Passport
 
app.use(session({ secret: 'keyboard cat',resave: true, saveUninitialized:true})); // session secret
// app.use(passport.initialize());
// app.use(passport.session()); // persistent login sessions

//require('./config/passport.js/index.js')(passport, db.user);
// require("./routes/html-routes.js")(app);
//require("./routes/api-routes.js")(app);

//Sync Database
// db.sequelize.sync().then(function() {
//   console.log('Nice! Database looks fine');
// }).catch(function(err) {
//   console.log(err, "Something went wrong with the Database Update!");
// });

module.exports = app;

app.set('port', process.env.PORT || 8000);
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.use('/views', express.static(path.join(__dirname, 'views')));
// app.set('view engine', 'jade');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/cartrust-db";
var style = fs.readFileSync('./views/style.css', 'utf8', function read(err, data) {
	if (err) {
			throw err;
	}
});


// var mongoDB = process.env.MONGODB_URI || url;
// mongoose.connect(mongoDB, { useNewUrlParser: true });
// mongoose.Promise = global.Promise;
// var connection = mongoose.connection;
// connection.on('error', console.error.bind(console, 'Mongo connect error:'));


var mysql = require('mysql');
var mysqlconnection = mysql.createConnection({
	host: 'localhost',
  user: 'root',
  database: 'vehicles'
})
/*
{//test
	mysqlconnection.connect(function(err) {
		if(err) throw err;
		console.log('msql connected');

		mysqlconnection.query('SELECT * FROM vehicles_mysql WHERE id=41222', function(err, results) {
			if (err) throw err;
			// console.log(results);
			//console.log(results[2].make);
			//console.log(results[2].model);
		})
		mysqlconnection.end();
		console.log('mysql ended');
	});
}
*/
distance.apiKey = 'AIzaSyAb8oJH8_dT59c_wDoGNIVSkKn2AM1b65I';

// distance.get(
//   {
//     origin: 'ECEB',
//     destination: 'Trustwave Chicago',
//     units: 'imperial'
//   },
//   function(err, data) {
// 		if (err) return console.log(err);
// 		var parsedDistance = data.distance;
// 		parsedDistance = parsedDistance.slice(0, -3);
//     console.log(parsedDistance);
// });

var urldata = 'http://api.eia.gov/series/?api_key=24e54aa757eeef0ba593db7a4923fd3c&series_id=TOTAL.MGUCUUS.M'; // gas api

// function GasResponse(response) {
// 	var gasdata = ''; //This will store the page we're downloading.

// 	response.on('data', function(chunk) { //Executed whenever a chunk is received.
// 					gasdata += chunk; //Append each chunk to the data variable.
// 	});

// 	response.on('end', function() {
// 		var body = JSON.parse(gasdata);
// 		console.log(body.series[0].data[0][1]);
// 	});
// }

// http.request(urldata, GasResponse).end();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));


app.get('/account', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(request, response) {
	console.log("AUTH");
	var username = request.body.username;
	var password = request.body.password;
	console.log(username);
	console.log(password);
	if (username && password) {
		mysqlconnection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/success');
			} else {
				response.redirect('/fail');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/fail', function(request, response) {
	response.sendFile(path.join(__dirname + '/fail.html'));
});

app.get('/success', function(request, response) {
	// if (request.session.loggedin) {
	// 	//response.send('Welcome back, ' + request.session.username + '!');
	// 	response.redirect('/');
	// } else {
	// 	response.send('Please login to view this page!');
	// }
	// response.end();
	response.sendFile(path.join(__dirname + '/success.html'));
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static("public"));
app.use('/', indexRouter);
app.use('/users', usersRouter);
//app.use('/signup', authRouter);
app.post('/process/demo', function(req, res){
  console.log('Handling /process/demo');
  console.log(req.body);
  var pyear = req.body.year;
  var pmake = req.body.make;
  console.log(pyear, pmake);
})

app.post('/process/cars', function(req, res){
	console.log('Handling /process/cars');
	console.log(req.session.name);
  var mysqlconnection = mysql.createConnection({
		host: 'localhost',
  	user: 'root',
 		database: 'vehicles'
  })

  var pYear, pMake, pModel, pMPG, pMPGh, pTrans, pDrive, pClass;
  mysqlconnection.connect(function(err) {
    var paramYear = req.param('year');
    var paramMake = req.param('make');
    var paramModel = req.param('model');
    // console.log(paramYear, paramMake, paramModel);
    mysqlconnection.query('SELECT * FROM vehicles_mysql WHERE (year ='
        + Number(paramYear) + ' AND make = "' + paramMake +
        '" AND model = "'+ paramModel + '")', function(err, data) {
      if (err) throw err;
      // console.log(data);
      if(data.length == 0){
        res.writeHead('200', {'Content-Type' : 'text/html;charset=utf8'});
				res.write('<div><p><font size = "6"> CAR ENIM NON EST </font></p></div> ')
        res.write("<br><br><a href = '/'> Not found! Back to search page</a>");
        res.end();
      }
			else {
				gis(paramYear+' '+paramMake+' '+paramModel, logResults);
				function logResults(error, imgResults){
					if (error) console.log(error);
					urlImage = JSON.stringify(imgResults[0]["url"], null, ' ');
					// console.log(data);
					pYear = data[0]["year"];//this works
					pMake = data[0]["make"];
					pModel = data[0]["model"];
					pMPG = data[0]["UCity"];
					pClass = data[0]["VClass"];
					pMPGh = data[0]["UHighway"];
					pTrans = data[0]["trany"];
					pDrive = data[0]["drive"];
					pVid = data[0]["id"];
					// res.writeHead('200', {'Content-Type' : 'text/html;charset=utf8'}, '<style>background-color: #F8EDA8; </style>');
					console.log(req.url);
					switch (req.url) {
						case "/style.css" :
								res.writeHead(200, {"Content-Type": "text/css"});
								res.write(style);
								break;
						default :    
								res.writeHead(200, {"Content-Type": "text/html"});
								// res.write(htmlFile);
								console.log('html');
					}
					// res.writeHead('<style>background-color: #F8EDA8; </style>')
					// res.write('<font color="red">This is some text!</font>');
					// res.write('<body style="background-image:url("./views/bgp.jpg"); background-position:center; background-repeat: no-repeat;background-size:cover"></body>')
					res.write('<body style="background-image:url(\'http://papers.co/wallpaper/papers.co-ar93-peugeot-dark-car-logo-art-illustration-41-iphone-wallpaper.jpg\'); background-position:center; background-repeat: repeat;background-size:auto"></body>')					
					res.write('<h1 style="color:#ffffff;text-align:center;font-family:Trebuchet MS"> This is response of the query </h1>');
					var urlImage;
					// console.log(pYear, pMake, pModel, pMPG);

					// res.write('<h1 style="color:blue;text-align:center;font-family:Trebuchet MS;">This is a heading</h1>');
					// res.write('<p style="color:red;text-align:center;">This is a paragraph.</p>');
					res.write('<div><img src='+urlImage+' alt="carpic" style="width:50%;height:auto;align:middle;"/></div>');
					res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">Year: ' + pYear + '</p></div>');
					res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">Make: ' + pMake + '</p></div>');
					res.write('<div><p  style="color: #ffffff;font-family:Trebuchet MS;">Model: ' + pModel + '</p></div>');
					res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">Vehicle Class: ' + pClass + '</p></div>');
					res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">MPG City: ' + pMPG + '</p></div>');
					res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">MPG Highway: ' + pMPGh + '</p></div>');
					res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">Transmission: ' + pTrans + '</p></div>');
					res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">Drive: ' + pDrive + '</p></div>');
					res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">ID: ' + pVid + '</p></div>');
					res.write('<br><br><div><p style="color: #ffffff;font-family:Trebuchet MS;">Mileage</p></div>');
					res.write('<form method="post" action="/process/mileage">');
					res.write('<table> <tr><td><label style="color: #ffffff;font-family:Trebuchet MS;">Add Location (optional): </label></td>');
					res.write('<td><input type="text" id="origin" name="origin" /></td></tr> </table>');
					res.write('<input type="submit" value="View Milage" name="" />');
					res.write('</form>');
          res.write('<div><p>---------------------------------------------</p></div>')

          var QUERY = 'SELECT * FROM NEWLIST WHERE vehicle_id = ' + pVid + ' ORDER BY RAND()';
					mysqlconnection.query(QUERY, function(err2, data2) {
						if (err2) throw err2;
						if(data2.length !=  0){
							console.log(data2);
              res.write('<h1 style="color: #ffffff;font-family:Trebuchet MS;">Relevant Listings </h1>');
              for(var i = 0;( i < 20 && i < data2.length); i++){
                res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">listing id: ' + data2[i]["listing_id"] + '</p></div>');
                res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">year: ' + data[0]["year"] + '</p></div>');
                res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">make: ' + data[0]["make"] + '</p></div>');
                res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">model: ' + data[0]["model"] + '</p></div>');
                res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">location: ' + data2[i]["address"] + '</p></div>');
                res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">price: ' + data2[i]["price"] + '</p></div>');
                res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">mileage: ' + data2[i]["odometer"] + '</p></div>');
        	if(data2[i]["vin"] != undefined)
                	res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">vin: ' + data2[i]["vin"] + '</p></div>');
                res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">paint: ' + data2[i]["paint"] + '</p></div>');
                res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">condition: ' + data2[i]["condition"] + '</p></div>');
                res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">odometer: ' + data2[i]["odometer"] + '</p></div>');
                res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">fuel: ' + data2[i]["fuel"] + '</p></div>');
                res.write('<div><img src = ' + data2[i]["image"] + '></div>');
        	if(data2[i]["from_craig"] == 1)
        		res.write('<div><p><a href = ' +data2[i]["url_username"] + '>Craigs</a></p></div>');
                res.write("<br><br>");
              }
						}
            else{
              res.write('<h1 style="color: #ffffff;font-family:Trebuchet MS;"> No listing found for this car </h1>');
            }
						var perm1, perm2;
						res.write('<div><p></p></div>');
						res.write('<div><p></p></div>');

						//start of avg mpg
						// var callback = function(code, retVal, stderr) {
						// 	perm1 = retVal;
						// 	if(perm1.length != 0){
						// 		dialog.entry('Destination: ', "entry prompt", 0, callback2);
						// 	}
						// }
						// var callback2 = function(code, retVal2, stderr) { //distance
						// 	perm2 = retVal2;
						// 	console.log(perm1);
						// 	console.log(perm2);
						// 	if(perm2.length != 0){
						// 		distance.get(
						// 			{
						// 				origin: perm1,
						// 				destination: perm2,
						// 				units: 'imperial'
						// 			},
						// 			function(err, distanceData) {
						// 				if (err) return console.log(err);
						// 				if(distanceData.length == 0){
            //
						// 				}
						// 				var parsedDistance = distanceData.distance;
						// 				parsedDistance = parsedDistance.slice(0, -3);
						// 				console.log(parsedDistance);
						// 				// console.log(distanceData);
						// 				http.request(urldata, GasResponse).end();
            //
						// 				function GasResponse(response) {
						// 					var gasdata = ''; //This will store the page we're downloading.
            //
						// 					response.on('data', function(chunk) { //Executed whenever a chunk is received.
						// 									gasdata += chunk; //Append each chunk to the data variable.
						// 					});
            //
						// 					response.on('end', function() {
						// 						var body = JSON.parse(gasdata);
						// 						var avgGas = body.series[0].data[0][1];
						// 						var avgCost = (parsedDistance/pMPG)*avgGas * 2 * 261; //x2 for roundtrip and x261 work
						// 						avgCost = JSON.stringify(avgCost);
						// 						console.log(avgCost);
						// 						// dialog.info(avgCost, 'Average Cost');
						// 						dialog.warn(avgCost, 'Average Cost for ', function(exitCode) {
						// 							if (exitCode == 0) console.log('User clicked OK');
						// 						})
						// 					});
						// 				}
            //
						// 		});
						// 	}
						// }
						// dialog.entry('Origin: ', "entry prompt", 0, callback);
						// //end of avg mpg

						res.write("<br><br><a href = '/'> Back to search page</a>");
						res.end();
    				mysqlconnection.end();
					});
				}
      }
    })
  });

});

app.post('/process/listings', function(req, res){
  console.log('Handling /process/listings');
  var mysqlconnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'vehicles'
  })




    mysqlconnection.query('SELECT * FROM NEWLIST as l, vehicles_mysql as v WHERE l.vehicle_id = v.id ORDER BY RAND()', function(err, data){
      if (err) throw err;
			// res.writeHead('200', {'Content-Type' : 'text/html;charset=utf8'});
			res.writeHead(200, {"Content-Type": "text/html"});						
			// res.write('<div><p><font size = "6"> NO ID INPUT </font></p></div> ')
			// res.write("<br><br><a href = '/'> Not found! Back to search page</a>");
			// res.end();
			if(data.length == 0){
				res.write('<div><p><font size = "6"> NO LISTINGS FOUND </font></p></div>');
				res.write("<br><br><a href = '/'> Back to search page</a>");
			}
			res.write('<div><h style="color: #ffffff;font-family:Trebuchet MS;font-size: 20;font-weight: bold;">Listings for Sale</p></div><br>');
			res.write('<body style="background-image:url(\'http://papers.co/wallpaper/papers.co-ar93-peugeot-dark-car-logo-art-illustration-41-iphone-wallpaper.jpg\'); background-position:center; background-repeat: repeat;background-size:auto"></body>')
      for(var i = 0; i < 20; i++){
        res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">listing id: ' + data[i]["listing_id"] + '</p></div>');
        res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">year: ' + data[i]["year"] + '</p></div>');
        res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">make: ' + data[i]["make"] + '</p></div>');
        res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">model: ' + data[i]["model"] + '</p></div>');
        res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">location: ' + data[i]["address"] + '</p></div>');
        res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">price: ' + data[i]["price"] + '</p></div>');
        res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">mileage: ' + data[i]["odometer"] + '</p></div>');
				if(data[i]["vin"] != "")
								res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">vin: ' + data[i]["vin"] + '</p></div>');
        res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">paint: ' + data[i]["paint"] + '</p></div>');
        res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">condition: ' + data[i]["condition"] + '</p></div>');
				res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">odometer: ' + data[i]["odometer"] + '</p></div>');
				if(data[i]["fuel"] != "")
        				res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">fuel: ' + data[i]["fuel"] + '</p></div>');
        res.write('<div><img src =' + data[i]["image"] + '></div>')
	if(data[i]["from_craig"] == 1)
		res.write('<div><p><a href = ' + data[i]["url_username"] + '>Craigs</a></p></div>');

        res.write("<br><br>");
      }
			if(data.length > 0){
			res.write('<body style="background-image:url(\'https://car-pictures-download.com/wp-content/uploads/2018/11/car-wallpapers-hd-download-Ford-Mustang-iphone.jpg\'); background-position:center; background-repeat: no-repeat;background-size:cover"></body>')
      res.write('<form method="post" action="/process/showupdatelistings">');
      res.write('<table> <tr><td><label style="color: #ffffff;font-family:Trebuchet MS;">Listing ID to update: </label></td>');
      res.write('<td><input type="number" id="listing_id" name="listing_id" /></td></tr> </table>');
      res.write('<input type="submit" value="Update Listings" name="" />');
      res.write('</form>');

      res.write('<form method="post" action="/process/deletelisting">');
      res.write('<table> <tr><td><label style="color: #ffffff;font-family:Trebuchet MS;">Listing ID to delete: </label></td>');
      res.write('<td><input type="number" id="deletionID" name="deletionID" /></td></tr> </table>');
      res.write('<input type="submit" value="Delete Listings" name="" />');
      res.write('</form>');
			}
      res.write("<br><br><a href = '/'> Back to search page</a>");
      res.end();
    })
});

app.post('/process/findlistings', function(req, res){
  console.log('Handling /process/findlistings');
  var param_findingID = req.param('findingID');
  console.log(param_findingID);
  var mysqlconnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'vehicles'
  })
    var adQuery = "SELECT * FROM NEWLIST as l, vehicles_mysql as v WHERE l.vehicle_id = v.id AND l.listing_id = " + param_findingID;
    mysqlconnection.query(adQuery, function(err, data){

      if (err) throw err;
      console.log(data);
      res.writeHead('200', {'Content-Type' : 'text/html;charset=utf8'});
			if(data.length == 0){
				res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;"><font size = "6"> NO LISTINGS FOUND </font></p></div>');
				res.write("<br><br><a href = '/'> Back to search page</a>");

			}
		res.write('<body style="background-image:url(\'https://car-pictures-download.com/wp-content/uploads/2018/11/car-wallpapers-hd-download-Ford-Mustang-iphone.jpg\'); background-position:center; background-repeat: no-repeat;background-size:cover"></body>')
        res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">listing id: ' + data[0]["listing_id"] + '</p></div>');
       	res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">year: ' + data[0]["year"] + '</p></div>');
        res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">make: ' + data[0]["make"] + '</p></div>');
        res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">model: ' + data[0]["model"] + '</p></div>');
        res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">location: ' + data[0]["address"] + '</p></div>');
        res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">price: ' + data[0]["price"] + '</p></div>');
        res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">mileage: ' + data[0]["odometer"] + '</p></div>');

        if(data[0]["vin"] != "")
        	 res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">vin: ' + data[0]["vin"] + '</p></div>');

        res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">paint: ' + data[0]["paint"] + '</p></div>');
        res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">condition: ' + data[0]["condition"] + '</p></div>');
        res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">odometer: ' + data[0]["odometer"] + '</p></div>');
        res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">fuel: ' + data[0]["fuel"] + '</p></div>');
        res.write('<div><img src =' + data[0]["image"] + '></div>')

	if(data[0]["from_craig"] == 1)
		res.write('<div><p><a href = ' + data[0]["url_username"] + '>Craigs</a></p></div>');
        res.write("<br><br>");

			if(data.length > 0){
      res.write('<form method="post" action="/process/showupdatelistings">');
      res.write('<table> <tr><td><label style="color: #ffffff;font-family:Trebuchet MS;">Listing ID to update: </label></td>');
      res.write('<td><input type="number" id="listing_id" name="listing_id" /></td></tr> </table>');
      res.write('<input type="submit" value="Update Listings" name="" />');
      res.write('</form>');

      res.write('<form method="post" action="/process/deletelisting">');
      res.write('<table> <tr><td><label style="color: #ffffff;font-family:Trebuchet MS;">Listing ID to delete: </label></td>');
      res.write('<td><input type="number" id="deletionID" name="deletionID" /></td></tr> </table>');
      res.write('<input type="submit" value="Delete Listings" name="" />');
      res.write('</form>');
			}
      res.write("<br><br><a href = '/'> Back to search page</a>");
      res.end();
    })
});


app.post('/process/mileage', function(req, res){
	console.log('handling mileage');
	var mysqlconnection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		database: 'vehicles'
	})

	var location = req.param('origin');
	if(location.length != 0){
		var tempQ = "INSERT INTO usertable (user_id, locations) VALUES (1,'"+location+"')";
		mysqlconnection.query(tempQ, function(err, results){
			if (err) throw err;
			console.log(results);
		});
	}
	// console.log(temp);
	// console.log(temp2);
	mysqlconnection.query('SELECT * FROM usertable where user_id = 1', function(err, data){
		if (err) throw err;
		res.writeHead('200', {'Content-Type' : 'text/html;charset=utf8'});
		res.write('<body style="background-image:url(\'https://car-pictures-download.com/wp-content/uploads/2018/11/car-wallpapers-hd-download-Ford-Mustang-iphone.jpg\'); background-position:center; background-repeat: no-repeat;background-size:cover"></body>')
		if(data.length == 0){
			res.write('<div><p><font size = "6"> NO LISTINGS FOUND </font></p></div>');
      res.write("<br><br><a href = '/'> Back to search page</a>");
		}

		res.write('<div>');
		for(var i = 0; i < data.length; i++){
			var tempI = i+1;
			res.write('<p style="color: #ffffff;font-family:Trebuchet MS;">Location '+tempI+':' + data[i]["locations"] + '</p>');
		}
		res.write('</div>');
		distance.get(
			{
				origin: data[0]["locations"],
				destination: data[1]["locations"],
				units: 'imperial'
			},
			function(err, distanceData) {
				if (err) return console.log(err);
				if(distanceData.length == 0){
					//do nothing
				}
				res.write('<br><br>');
				res.write('<div><h style="color: #ffffff;font-family:Trebuchet MS;">Average Yearly Gas Costs Calculations: $Answer From (Origin -> Destination (mi) + Desination -> Origin (mi))/MPG * Average Gas Price for Current Time&Location * Average Work Days per Year </h></div>');
				res.write('<br><br>');
        // res.write('<div><p>Origin: ' + data[0]["locations"] + '</p></div>');
        // res.write('<div><p>Destination: ' + data[1]["locations"] + '</p></div>');
				var parsedDistance = distanceData.distance;
				parsedDistance = parsedDistance.slice(0, -3);
				console.log(parsedDistance);
				// console.log(distanceData);
				http.request(urldata, GasResponse).end();

				function GasResponse(response) {
					var gasdata = ''; //This will store the page we're downloading.
					
					response.on('data', function(chunk) { //Executed whenever a chunk is received.
									gasdata += chunk; //Append each chunk to the data variable.
					});
					
					response.on('end', function() {
						var body = JSON.parse(gasdata);
						var avgGas = body.series[0].data[0][1]; 
						var avgCost = (parsedDistance/25.8154)*avgGas * 2 * 261; //x2 for roundtrip and x261 work
						avgCost = JSON.stringify(avgCost);
						console.log(avgCost);
						avgCost = Math.trunc(100 * avgCost) / 100;						
						res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">Average Yearly Gas Costs: $'+avgCost+' From '+data[0]["locations"]+ ' to '+ data[1]["locations"]+'</p> </div>')
						// dialog.info(avgCost, 'Average Cost');
						distance.get(
							{
								origin: data[0]["locations"],
								destination: data[2]["locations"],
								units: 'imperial'
							},
							function(err, distanceData) {
								if (err) return console.log(err);
								if(distanceData.length == 0){
				
								}
								// res.write('<div><p>Origin: ' + data[0]["locations"] + '</p></div>');
								// res.write('<div><p>Destination: ' + data[2]["locations"] + '</p></div>');
								var parsedDistance = distanceData.distance;
								parsedDistance = parsedDistance.slice(0, -3);
								console.log(parsedDistance);
								// console.log(distanceData);
								http.request(urldata, GasResponse).end();
				
								function GasResponse(response) {
									var gasdata = ''; //This will store the page we're downloading.
									
									response.on('data', function(chunk) { //Executed whenever a chunk is received.
													gasdata += chunk; //Append each chunk to the data variable.
									});
									
									response.on('end', function() {
										var body = JSON.parse(gasdata);
										var avgGas = body.series[0].data[0][1]; 
										var avgCost = (parsedDistance/25.8154)*avgGas * 2 * 261; //x2 for roundtrip and x261 work
										avgCost = JSON.stringify(avgCost);
										console.log(avgCost);
										avgCost = Math.trunc(100 * avgCost) / 100;
										res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">Average Yearly Gas Costs: $'+avgCost+' From '+data[0]["locations"]+ ' to '+ data[2]["locations"]+'</p> </div>')
										// dialog.info(avgCost, 'Average Cost');
										distance.get(
											{
												origin: data[2]["locations"],
												destination: data[1]["locations"],
												units: 'imperial'
											},
											function(err, distanceData) {
												if (err) return console.log(err);
												if(distanceData.length == 0){
								
												}
												// res.write('<div><p>Origin: ' + data[2]["locations"] + '</p></div>');
												// res.write('<div><p>Destination: ' + data[1]["locations"] + '</p></div>');
												var parsedDistance = distanceData.distance;
												parsedDistance = parsedDistance.slice(0, -3);
												console.log(parsedDistance);
												// console.log(distanceData);
												http.request(urldata, GasResponse).end();
								
												function GasResponse(response) {
													var gasdata = ''; //This will store the page we're downloading.
													
													response.on('data', function(chunk) { //Executed whenever a chunk is received.
																	gasdata += chunk; //Append each chunk to the data variable.
													});
													
													response.on('end', function() {
														var body = JSON.parse(gasdata);
														var avgGas = body.series[0].data[0][1]; 
														var avgCost = (parsedDistance/25.8154)*avgGas * 2 * 261; //x2 for roundtrip and x261 work
														avgCost = JSON.stringify(avgCost);
														console.log(avgCost);
														avgCost = Math.trunc(100 * avgCost) / 100;
														res.write('<div><p style="color: #ffffff;font-family:Trebuchet MS;">Average Yearly Gas Costs: $'+avgCost+' From '+data[1]["locations"]+ ' to '+ data[2]["locations"]+'</p> </div>')
														// dialog.info(avgCost, 'Average Cost');
														res.write("<br><br><a href = '/'> Back to search page</a>");
														res.end();
													});
												}
												
										});
									});
								}
							
						});
					});
				}
				
		});
		
		
	
	})
})

app.post('/process/deletelisting', function(req, res){
  console.log('Handling /process/deletelistings');

	var param_id = req.param('deletionID');
	if(param_id.length == 0){
		res.writeHead('200', {'Content-Type' : 'text/html;charset=utf8'});
		res.write('<div><p><font size = "6"> NO ID INPUT </font></p></div> ')
		res.write("<br><br><a href = '/'> Not found! Back to search page</a>");
		res.end();
	}
	else{
		var mysqlconnection = mysql.createConnection({
			host: 'localhost',
			user: 'root',
			database: 'vehicles'
		})
  mysqlconnection.connect(function(err){
    if(err) throw err;
    console.log('mysql connected');
		var TESTQ = "SELECT * FROM `NEWLIST` WHERE `listing_id` = " + param_id;
		// var condition;
		var PREPARE = "PREPARE predel FROM 'DELETE FROM `NEWLIST` WHERE `listing_id` = ?'; ";
		mysqlconnection.query(PREPARE);
		mysqlconnection.query(TESTQ,
			function(err, data){
				if (err) throw err;
				if(data.length > 0){
					// var QUERY = "DELETE FROM `listings` WHERE `listing_id` = " + param_id;
					var READY = "SET @pc = '" + param_id + "'; ";
					
					mysqlconnection.query(READY);
					var QUERY = "EXECUTE predel USING @pc;"
					mysqlconnection.query(QUERY,
					function(err){
						if (err) throw err;
						res.writeHead('200', {'Content-Type' : 'text/html;charset=utf8'});
						res.write("<br><br><a href = '/'>Delete success!\n Back to search page</a>");
						res.end();
					})
					mysqlconnection.query("DEALLOCATE PREPARE predel");
					mysqlconnection.end();

				}
				else{
					res.writeHead('200', {'Content-Type' : 'text/html;charset=utf8'});
					res.write("<br><br><a href = '/'>Delete failed! ID not found!\n Back to search page</a>");
					res.end();
					mysqlconnection.query("DEALLOCATE PREPARE predel");
					mysqlconnection.end();

				}
		})
		// console.log(condition);

		// console.log('msql disconnected');
		// mysqlconnection.end();
  })}
});

app.post('/process/showupdatelistings', function(req, res){
  var param_id = req.param('listing_id');
  console.log('Handling /process/showupdatelistings');
	if(param_id.length == 0){
		res.writeHead('200', {'Content-Type' : 'text/html;charset=utf8'});
		res.write('<div><p><font size = "6"> NO ID INPUT </font></p></div> ')
		res.write("<br><br><a href = '/'> Not found! Back to search page</a>");
		res.end();
	}
	else{
	var mysqlconnection = mysql.createConnection({
		host: 'localhost',
    user: 'root',
    database: 'vehicles'
	})
	mysqlconnection.connect(function(err) {
		if(err) throw err;
		console.log('msql connected');

		mysqlconnection.query("SELECT * FROM NEWLIST WHERE listing_id = "
		+ param_id, function(err, results) {
      console.log(results[param_id]);
			if (err) throw err;

			res.writeHead('200', {'Content-Type' : 'text/html;charset=utf8'});
			if (results.length == 0){
				res.write('<div><p><font size = "6"> ID enim non est </font></p></div>');
			}else
			{
				res.write('<body style="background-image:url(\'https://car-pictures-download.com/wp-content/uploads/2018/11/car-wallpapers-hd-download-Ford-Mustang-iphone.jpg\'); background-position:center; background-repeat: no-repeat;background-size:cover"></body>');
				res.write('<form method="post" action="/process/updatelistings">');
	    	res.write('<div>')


	    	res.write('<p style="color: #ffffff;font-family:Trebuchet MS;">Listing ID: ' + results[0]["listing_id"] + '</p>');
	    	// res.write('<input type="hidden" id="_id" value="' + results[0]["_id"] +'" />');
	    	res.write('<td><input type="hidden" id="listing_id" name="listing_id" value="' + results[0]["listing_id"] + '" /></td></tr> </table>');

	    	// res.write('<table> <tr><td><label>new year: </label></td>');
	    	res.write('<p style="color: #ffffff;font-family:Trebuchet MS;">vehicle_id: ' + results[0]["vehicle_id"] + '</p>');
	    	res.write('<table> <tr><td><label style="color: #ffffff;font-family:Trebuchet MS;">new vehicle_id: </label></td>');
	    	res.write('<td><input type="number" id="vehicle_id" name="vehicle_id" value="' + results[0]["vehicle_id"] + '" /></td></tr> </table>');

        res.write('<p style="color: #ffffff;font-family:Trebuchet MS;">url_username: ' + results[0]["url_username"] + '</p>');
	    	res.write('<table> <tr><td><label style="color: #ffffff;font-family:Trebuchet MS;">new url_username: </label></td>');
	    	res.write('<td><input type="text" id="url_username" name="url_username" value="' + results[0]["url_username"] + '" /></td></tr> </table>');

        res.write('<p style="color: #ffffff;font-family:Trebuchet MS;">brief: ' + results[0]["brief"] + '</p>');
	    	res.write('<table> <tr><td><label style="color: #ffffff;font-family:Trebuchet MS;">new brief: </label></td>');
	    	res.write('<td><input type="text" id="brief" name="brief" value="' + results[0]["brief"] + '" /></td></tr> </table>');

        res.write('<p style="color: #ffffff;font-family:Trebuchet MS;">address: ' + results[0]["address"] + '</p>');
	    	res.write('<table> <tr><td><label style="color: #ffffff;font-family:Trebuchet MS;">new address: </label></td>');
	    	res.write('<td><input type="text" id="address" name="address" value="' + results[0]["address"] + '" /></td></tr> </table>');

        res.write('<p style="color: #ffffff;font-family:Trebuchet MS;">description: ' + results[0]["description"] + '</p>');
	    	res.write('<table> <tr><td><label style="color: #ffffff;font-family:Trebuchet MS;">new description: </label></td>');
	    	res.write('<td><input type="text" id="description" name="description" value="' + results[0]["description"] + '" /></td></tr> </table>');

        res.write('<p style="color: #ffffff;font-family:Trebuchet MS;">price: ' + results[0]["price"] + '</p>');
	    	res.write('<table> <tr><td><label style="color: #ffffff;font-family:Trebuchet MS;">new price: </label></td>');
	    	res.write('<td><input type="number" id="price" name="price" value="' + results[0]["price"] + '" /></td></tr> </table>');

        res.write('<p style="color: #ffffff;font-family:Trebuchet MS;">fuel: ' + results[0]["fuel"] + '</p>');
	    	res.write('<table> <tr><td><label style="color: #ffffff;font-family:Trebuchet MS;">new fuel: </label></td>');
	    	res.write('<td><input type="text" id="fuel" name="fuel" value="' + results[0]["fuel"] + '" /></td></tr> </table>');

        res.write('<p style="color: #ffffff;font-family:Trebuchet MS;">transmission: ' + results[0]["transmission"] + '</p>');
	    	res.write('<table> <tr><td><label style="color: #ffffff;font-family:Trebuchet MS;">new transmission: </label></td>');
	    	res.write('<td><input type="text" id="transmission" name="transmission" value="' + results[0]["transmission"] + '" /></td></tr> </table>');

        res.write('<p style="color: #ffffff;font-family:Trebuchet MS;">type: ' + results[0]["type"] + '</p>');
	    	res.write('<table> <tr><td><label style="color: #ffffff;font-family:Trebuchet MS;">new type: </label></td>');
	    	res.write('<td><input type="text" id="type" name="type" value="' + results[0]["type"] + '" /></td></tr> </table>');

        res.write('<p style="color: #ffffff;font-family:Trebuchet MS;">title_status: ' + results[0]["title_status"] + '</p>');
	    	res.write('<table> <tr><td><label style="color: #ffffff;font-family:Trebuchet MS;">new title_status: </label></td>');
	    	res.write('<td><input type="text" id="title_status" name="title_status" value="' + results[0]["title_status"] + '" /></td></tr> </table>');

        res.write('<p style="color: #ffffff;font-family:Trebuchet MS;">paint: ' + results[0]["paint"] + '</p>');
	    	res.write('<table> <tr><td><label style="color: #ffffff;font-family:Trebuchet MS;">new paint: </label></td>');
	    	res.write('<td><input type="text" id="paint" name="paint" value="' + results[0]["paint"] + '" /></td></tr> </table>');

        res.write('<p  style="color: #ffffff;font-family:Trebuchet MS;">odometer: ' + results[0]["odometer"] + '</p>');
	    	res.write('<table> <tr><td><label style="color: #ffffff;font-family:Trebuchet MS;">new odometer: </label></td>');
	    	res.write('<td><input type="number" id="odometer" name="odometer" value="' + results[0]["odometer"] + '" /></td></tr> </table>');

        res.write('<p style="color: #ffffff;font-family:Trebuchet MS;">drive: ' + results[0]["drive"] + '</p>');
	    	res.write('<table> <tr><td><label style="color: #ffffff;font-family:Trebuchet MS;">new drive: </label></td>');
	    	res.write('<td><input type="text" id="drive" name="drive" value="' + results[0]["drive"] + '" /></td></tr> </table>');

        res.write('<p style="color: #ffffff;font-family:Trebuchet MS;">cylinders: ' + results[0]["cylinders"] + '</p>');
	    	res.write('<table> <tr><td><label style="color: #ffffff;font-family:Trebuchet MS;">new cylinders: </label></td>');
	    	res.write('<td><input type="text" id="cylinders" name="cylinders" value="' + results[0]["cylinders"] + '" /></td></tr> </table>');

        res.write('<p style="color: #ffffff;font-family:Trebuchet MS;">condition: ' + results[0]["condition"] + '</p>');
	    	res.write('<table> <tr><td><label style="color: #ffffff;font-family:Trebuchet MS;">new condition: </label></td>');
	    	res.write('<td><input type="text" id="condition" name="condition" value="' + results[0]["condition"] + '" /></td></tr> </table>');

        res.write('<p style="color: #ffffff;font-family:Trebuchet MS;">vin: ' + results[0]["vin"] + '</p>');
	    	res.write('<table> <tr><td><label style="color: #ffffff;font-family:Trebuchet MS;">new vin: </label></td>');
	    	res.write('<td><input type="text" id="vin" name="vin" value="' + results[0]["vin"] + '" /></td></tr> </table>');

        res.write('<div><img src =' + results[0]["image"] + '></div>')

				res.write('<br>');
	    	res.write('</div>');
	    	res.write("<br><br>");


	    	res.write('<input type="submit" value="Update Listings!!!" name="" />');
	    	res.write('</form>');
			}
	    res.write("<br><br><a href = '/'> Back to search page</a>");


	    res.end();

		})
	mysqlconnection.end();
	console.log('msql disconnected');
	});
	}
});

app.post('/process/updatelistings', function(req, res){
  console.log('Handling /process/updatelistings');



console.log("4444444444444444444444444444444444444444444444444444444444444444444444444444")


	var mysqlconnection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		database: 'vehicles'
	})
	console.log("54545454545454545454545454545454545454545454545454545")
	mysqlconnection.connect(function(err) {
    if(err) throw err;

    var paramLid = req.param('listing_id');
    var paramVid = req.param('vehicle_id');

    var paramUsername = req.param('url_username');
    var paramBrief = req.param('brief');
    var paramAddr = req.param('address');
    var paramDesc = req.param('description');
    var paramPrice = req.param('price');
    var paramFuel = req.param('fuel');
    var paramTrans = req.param('transmission');
    var paramType = req.param('type');
    var paramTitle = req.param('title_status');
    var paramPaint = req.param('paint');
    var paramOdom = req.param('odometer');
    var paramDrive = req.param('drive');
    var paramCyln = req.param('cylinders');
    var paramCond = req.param('condition');
    var paramVin = req.param('vin');

		console.log("555555555555555555555555555555555555555555555")
		var SQL = "UPDATE NEWLIST SET vehicle_id = " + paramVid +
    " , url_username = '" + paramUsername +
		"', brief = '" + paramBrief +
		"', address = '" + paramAddr +
		"', description = '" + paramDesc +
		"', price = " + paramPrice +
		" , fuel = '" + paramFuel +
    "', transmission = '" + paramTrans +
    "', type = '" + paramType +
    "', title_status = '" + paramTitle +
    "', paint = '" + paramPaint +
    "', odometer = " + paramOdom +
    " , drive = '" + paramDrive +
    "', cylinders = '" + paramCyln +
    "', `condition` = '" + paramCond +
    "', vin = '" + paramVin +
"', from_craig = 0, area = 'N/A' WHERE listing_id = " + paramLid;
    if(paramVid.length == 0 || paramBrief.length == 0 || paramPrice.length == 0){
      res.writeHead('200', {'Content-Type' : 'text/html;charset=utf8'});
      res.write('<div><p><font size = "6"> ANNO, Fecimus, exemplar exstat et regula locum habere nequeunt LIQUIDE </font></p></div> ')
      res.write("<br><br><a href = '/'> Not found! Back to search page</a>");
      res.end();
      mysqlconnection.end();

    }else{
		mysqlconnection.query(SQL, function(err, results) {
			if (err) throw err;
			console.log(results);
			//console.log(results[2].make);
			//console.log(results[2].model);
			res.writeHead('200', {'Content-Type' : 'text/html;charset=utf8'});
			res.write("<br><br><a href = '/'>Success! Back to search page</a>");
			res.end();
			mysqlconnection.end();

		})
    }
		console.log('mysql ended');
	});

});


app.post('/process/newlisting', function(req, res){
  console.log('Handling /process/newlisting');

		var mysqlconnection = mysql.createConnection({
			host: 'localhost',
			user: 'root',
			database: 'vehicles'
		})
		mysqlconnection.connect(function(err) {
			if(err) throw err;

			var paramVid = req.param('vehicle_id');
      var paramYear = req.param('year');
      var paramMake = req.param('make');
      var paramModel = req.param('model');


      var paramUsername = req.param('url_username');
      var paramBrief = req.param('brief');
      var paramAddr = req.param('address');
      var paramDesc = req.param('description');
      var paramPrice = req.param('price');
      var paramFuel = req.param('fuel');
      var paramTrans = req.param('transmission');
      var paramType = req.param('type');
      var paramTitle = req.param('title_status');
      var paramPaint = req.param('paint');
      var paramOdom = req.param('odometer');
      var paramDrive = req.param('drive');
      var paramCyln = req.param('cylinders');
      var paramCond = req.param('condition');
      var paramVin = req.param('vin');

      if(paramVid.length == 0 && (paramYear.length == 0 || paramMake.length == 0 || paramModel.length == 0)){
				res.writeHead('200', {'Content-Type' : 'text/html;charset=utf8'});
				res.write('<div><p><font size = "6"> ANNO, Fecimus, exemplar exstat et regula locum habere nequeunt LIQUIDE </font></p></div> ')
				res.write("<br><br><a href = '/'> Not found! Back to search page</a>");
				res.end();
			}

      if (paramVid.length == 0){
        var QUERY = "SELECT id FROM vehicles_mysql WHERE YEAR = " + paramYear +
        " AND MAKE = '" + paramMake +
        "' AND MODEL = '" + paramModel + "'";

        mysqlconnection.query(QUERY, function(err, results) {
          if (err) throw err;
          if (results.length == 0){
            res.writeHead('200', {'Content-Type' : 'text/html;charset=utf8'});
            res.write('<div><p><font size = "6"> ANNO, Fecimus, exemplar exstat et regula locum habere nequeunt LIQUIDE </font></p></div> ')
            res.write("<br><br><a href = '/'> Not found! Back to search page</a>");
            res.end();
			mysqlconnection.end();
          }
          else{
            paramVid = results[0]["id"]
            var QUERY = "INSERT INTO NEWLIST(vehicle_id, url_username ,brief ,address ,description , price, fuel, transmission ,type ,title_status ,paint ,odometer ,drive ,cylinders ,`condition` ,vin, from_craig) VALUES(" +
            paramVid + ", '" + paramUsername + "', '" + paramBrief + "', '" + paramAddr + "', '" + paramDesc + "', " + paramPrice + ", '" + paramFuel + "','" + paramTrans + "', '" + paramType + "', '" + paramTitle + "', '" + paramPaint + "',"
            + paramOdom + ", '" + paramDrive + "', '" + paramCyln + "', '" + paramCond + "', '" + paramVin + "', " + 0 +
            ")";
            mysqlconnection.query(QUERY, function(err, results) {
              if (err) throw err;
              console.log(results);
              //console.log(results[2].make);
              //console.log(results[2].model);
              res.writeHead('200', {'Content-Type' : 'text/html;charset=utf8'});
              res.write("<br><br><a href = '/'>Success! Back to search page</a>");
              res.end();
			mysqlconnection.end();
            })
          }
        })

      }



			console.log('mysql ended');

  })
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// var port = 8000;

// app.listen(port, () => console.log(`Example app listening on port ${port}!`))
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
// db.sequelize.sync().then(function() {
//   app.listen(PORT, function() {
//     console.log(" Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
//   });
// });
