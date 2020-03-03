const express = require('express'),
	bodyParser = require('body-parser'),
	request = require('request-promise'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	localStrategy = require('passport-local'),
	expressSession = require('express-session'),
	FCM = require('fcm-push');

const app = express()

const Admin = require('./models/admin'),
	Cron = require('./controllers/scheduler'),
	dotenv = require('dotenv').config();

//const mongoose_seed = require('./seed')

// routes
const indexRoutes = require('./routes/index'),
	trafficImagesRoutes = require('./routes/traffic-images'),
	viewRouteRoutes = require('./routes/viewroute'),
	carparkRoutes = require('./routes/carparks'),
	weatherRoutes = require('./routes/weather');

// mongoose.connect("mongodb://localhost:27017/cz2006");
//serve the content in 'public' directory.
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
	extended: true
}))
app.use(bodyParser.json())
app.set('view engine', 'ejs')

app.use(expressSession({
	secret: "some key",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize())
app.use(passport.session())

passport.use(new localStrategy(Admin.authenticate()))
passport.serializeUser(Admin.serializeUser())
passport.deserializeUser(Admin.deserializeUser())

app.use(function (req, res, next) {
	res.locals.admin = req.user
	next()
})

app.use(indexRoutes)
app.use(trafficImagesRoutes)
app.use(carparkRoutes)
app.use(viewRouteRoutes)
app.use(weatherRoutes)

// Port setup for heroku
let port = process.env.PORT;
if (port == null || port == "") {
	port = 8000
}

app.listen(port, function () {
	console.log('listening on port: ' + port);
})