const express = require('express'),
	router = express.Router(),
	dotenv = require('dotenv').config();

const googleMapsClient = require('@google/maps').createClient({
	key: process.env.GOOGLE_API_KEY,
	Promise: Promise
})

const carparkController = require('../controllers/carpark-controller')
const weatherController = require('../controllers/weather-controller')

// Weather controller returns the current weather condition for the next 2 hours
// of the carpark destination
router.get('/carparks', function (req, res) {
	weatherController.get2hrWeather(req.session.destinationLat, req.session.destinationLng).then(function (results) {
		res.render('carparks', {
			isRaining: results
		})
	})

})

// Get list of updated carpark details based on carparks list which is stored in session
router.get('/pullCarparks', function (req, res) {

	function pullCarparks() {
		return new Promise(function cb(resolve, reject) {

			checkAPI(req).then(function (result) {
				resolve(result)
			})

		}).catch(err => {
			return delay(15000).then(function () {
				pullCarparks()
			})
		})
	}

	pullCarparks()
		.then(function (result) {
			return res.json(result);
		}).catch(err => {
			console.log(err);
		})
})

// Takes in lat and lng from the location input page and passes it to the carpark controller
// to get a list of carparks which are near the destination
// carparks list is then stored in session
router.post('/carparks', function (req, res) {
	var current_location = {}
	var destination = {}

	// Convert location input to latitude and longitude values
	googleMapsClient.geocode({
			address: req.body.current_location
		})
		.asPromise()
		.then((response) => {
			current_location = response.json.results[0].geometry.location;
			googleMapsClient.geocode({
					address: req.body.destination
				})
				.asPromise()
				.then((response) => {
					destination = response.json.results[0].geometry.location

					// Store destination latlng in session to calculate the weather for that location later on
					req.session.destinationLat = destination.lat
					req.session.destinationLng = destination.lng

					// Get list of carparks which are within a fixed distance of calculated lat and lng, and store the list in session
					carparkController.getCarparkList(destination.lat, destination.lng, function (err, data) {
						if (err) {
							console.log(err)
						} else {
							req.session.currLat = current_location.lat;
							req.session.currLng = current_location.lng;
							req.session.carpark_list = data
							res.redirect('/carparks')
						}
					})
				})
				.catch((err) => {
					console.log(err)
				})
		})
		.catch((err) => {
			console.log(err)
		})
})

// Pass in list of carparks to carpark contronller and returns updated data from the LTA API
function checkAPI(req) {
	return new Promise(function (resolve, reject) {
		carparkController.checkCurrentLots(req.session.carpark_list, function (err, result) {
			if (err) {
				console.log(err)
				reject(err)
			} else {
				resolve(result)
			}
		})
	})
}

// Interval timer function using promise and settimeout to be accurate
function delay(t, v) {
	return new Promise(function (resolve) {
		setTimeout(resolve.bind(null, v), t)
	})
}

module.exports = router;