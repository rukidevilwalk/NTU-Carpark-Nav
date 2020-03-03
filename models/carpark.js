var mongoose = require('mongoose');

var carparkSchema = mongoose.Schema({
	id: String,
	development: String,
	location: String,
	lot_type: String,
});

module.exports = mongoose.model("carparks", carparkSchema);