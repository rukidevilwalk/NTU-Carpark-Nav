const express = require('express'),
	router = express.Router(),
	passport = require('passport');

const Admin = require('../models/admin');

const CompanyInformation = require('../models/company-information')
const Feedback = require('../models/feedback')
// const	carparkController = require('../controllers/carpark-controller');

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

router.get('/', function (req, res) {

	// carparkController.populateCarparkList();
	res.render("landing-page");
});

router.get('/register', isLoggedIn, function (req, res) {
	res.render("register");
});

router.post('/register', isLoggedIn, function (req, res) {
	var admin = new Admin({
		username: req.body.username
	});

	Admin.register(admin, req.body.password, function (err, admin) {
		if (err) {
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req, res, function () {
			res.redirect("/");
		});
	})
});

router.get('/login', function (req, res) {
	res.render("login");
});

router.post('/login', passport.authenticate("local", {
		successRedirect: "/",
		failureRedirect: "/login"
	}),
	function (req, res) {});

router.get('/logout', isLoggedIn, function (req, res) {
	req.logout();
	res.redirect('/');
});

router.get('/contact', function (req, res) {
	let company_information = {};

	CompanyInformation.findOne({}, function (err, info) {
		if (err) {
			//damn son
		} else {
			company_information = info;
			res.render('contact', {
				info: company_information
			});
		}
	});
});

router.get('/contact/update', isLoggedIn, function (req, res) {
	let company_information = {};

	CompanyInformation.findOne({}, function (err, info) {
		if (err) {
			//damn son
		} else {
			company_information = info;
			res.render('contact-update', {
				info: company_information
			});
		}
	});
});

router.post('/contact', isLoggedIn, function (req, res) {
	let company_information = {};

	CompanyInformation.findOne({}, function (err, info) {
		if (err) {
			//damn son
		} else {
			company_information = info;
			CompanyInformation.findByIdAndUpdate(company_information['_id'], {
				$set: {
					email_address: req.body.email_address,
					contact_no: req.body.contact_no
				}
			}, {
				new: true
			}, function (err, updated_info) {
				if (err) {
					//damn son
				} else {
					res.render('contact', {
						info: updated_info
					});
				}
			});
		}
	});
})

router.get('/feedback', function (req, res) {
	Feedback.find({}, function (err, feedbacks) {
		res.render('feedback', {
			feedbacks: feedbacks
		});
	})
});

router.post('/feedback', function (req, res) {
	let feedback = {};

	feedback['name'] = req.body.name;
	feedback['email_address'] = req.body.email_address;
	feedback['feedback'] = req.body.feedback;

	Feedback.create(feedback, function (err, feedback) {
		if (err) {
			//damn son
		} else {
			// Do a popup to thank user for their feedback
			// also to acknowledge that we have receive it.
			console.log(feedback);
			res.redirect('/');
		}
	});
});

module.exports = router;