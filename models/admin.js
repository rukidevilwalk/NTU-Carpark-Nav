const 	mongoose 				= require('mongoose'),
		passportLocalMongoose 	= require('passport-local-mongoose');

var adminSchema = mongoose.Schema({
	username: String,
	password: String,
	salt: String
});

adminSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('admins', adminSchema);