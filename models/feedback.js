const 	mongoose 	= require('mongoose');

const feedbackSchema = mongoose.Schema({
	name: String,
	email_address: String,
	feedback: String
});

module.exports = mongoose.model('Feedback', feedbackSchema);