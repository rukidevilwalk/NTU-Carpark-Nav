const mongoose = require('mongoose');

const companyInformationSchema = mongoose.Schema({
	description: String,
	milestones: [{
		year: String,
		content: String
	}],
	contact_no: String,
	email_address: String
});

module.exports = mongoose.model('CompanyInformation', companyInformationSchema);