const mongoose = require('mongoose');

const cameraSchema = mongoose.Schema({
	timestamp: Date,
	id: String,
	location: String,
	image: String,
	description: String
});

module.exports = mongoose.model("Cameras", cameraSchema);