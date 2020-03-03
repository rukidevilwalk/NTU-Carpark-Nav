const Camera = require('../models/camera');

exports.getLatestImages = function(callback){
	Camera.find().sort({timestamp: -1}).limit(87).exec(function (err, camera){
		if(err){
			console.log(err, null);
		} else {
			console.log(camera);
			callback(null, camera);
		}
	});
}