const request = require('request-promise'),
	CronJob = require('cron').CronJob,
	Camera = require('../models/camera'),
	mongoose = require('mongoose');

const TrafficImageJsonTemplate = require('../jsons/traffic-image.json');

let mogodb = process.env.MONGODB_URI;
if (mogodb == null || mogodb == "") {
	mogodb = "mongodb://localhost:27017/cz2006"
}
mongoose.connect(mogodb, {
	useNewUrlParser: true
})

new CronJob('0 */30 * * * *', function() {
	var options = {
		url: "https://api.data.gov.sg/v1/transport/traffic-images",
		json: true
	}

	request(options)
		.then(function (response){
			for(var i = 0; i < TrafficImageJsonTemplate['cameras'].length; i++){
				response['items'].forEach(function(item){
					item['cameras'].forEach(function(camera){
						if(TrafficImageJsonTemplate['cameras'][i]['id'] == camera['camera_id']){
							TrafficImageJsonTemplate['cameras'][i]['timestamp'] = camera['timestamp'];
							TrafficImageJsonTemplate['cameras'][i]['image'] = camera['image'];
							Camera.create(TrafficImageJsonTemplate['cameras'][i], function(err, camera){
								if(err){
									console.log(err);
								} else {
									console.log(camera);
								}
							})
						}
					})
				})
			}
		});
}, null, true, 'Asia/Singapore');