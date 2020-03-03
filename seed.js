var seeder = require('mongoose-seed')

// Connect to MongoDB via Mongoose
let mogodb = process.env.MONGODB_URI;
if (mogodb == null || mogodb == "") {
    mogodb = "mongodb://localhost:27017/cz2006";
}
seeder.connect(mogodb, function () {

	// Load Mongoose models
	seeder.loadModels([
		'./models/company-information.js'
	])

	// Clear specified collections
	seeder.clearModels(['CompanyInformation'], function () {

		// Callback to populate DB once collections have been cleared
		seeder.populateModels(data, function () {
			seeder.disconnect();
		})

	})
})

// Data array containing seed data - documents organized by Model
var data = [{
	'model': 'CompanyInformation',
	'documents': [{
		description: "Hello, it's me",
		milestones: [{
				year: "1999",
				content: "Officially Launched!"
			},
			{
				year: "2001",
				content: "Collaborated With LTA To Launch Collaborative System!"
			}
		],
		contact_no: "+65 1800-200-9898",
		email_address: "findoutmore@gmail.com"
	}]
}]