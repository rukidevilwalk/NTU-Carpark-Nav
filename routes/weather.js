const express = require('express'),
    router = express.Router();
const weatherController = require('../controllers/weather-controller')

router.get('/weather', function (req, res) {

    weatherController.get24hrWeather().then(function (results) {
        low_temp = results.general.temperature.low;
        high_temp = results.general.temperature.high;
        periods_24 = results.periods;

        res.render("weather", {
            low_temp: low_temp,
            high_temp: high_temp,
            periods_24: periods_24
        })

    })

})

module.exports = router;