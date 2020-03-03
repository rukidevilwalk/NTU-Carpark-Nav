const	express = require('express'),
		router	= express.Router(),
		request	= require('request-promise');

// template to map camera id to expressway
const 	TrafficImageJsonTemplate = require('../jsons/traffic-image.json');
const	cameraController = require('../controllers/camera-controller');

router.get('/traffic-images', function(req, res){
	cameraController.getLatestImages(function(err, data){
		if(err){
			console.log(err);
		} else {
			res.render('traffic-images', {images: data});
		}
	});
});

module.exports = router;