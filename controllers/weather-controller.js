const request = require("request-promise")

// Checks the 2hours weather for the area that is closest to the destination
// returns a boolean for weather its currently raining in the area or not
exports.get2hrWeather = function (lat, lng) {
    return new Promise(function (resolve, reject) {

        today = new Date()

        month = ("0" + (today.getMonth() + 1)).slice(-2)
        date = ("0" + today.getDate()).slice(-2)

        hours = ("0" + today.getHours()).slice(-2)
        min = ("0" + today.getMinutes()).slice(-2)
        seconds = ("0" + today.getSeconds()).slice(-2)

        wholedate = today.getFullYear() + '-' + month + '-' + date
        time = hours + "%3A" + min + "%3A" + seconds
        dateTime = wholedate + 'T' + time
        options = {
            url: "https://api.data.gov.sg/v1/environment/2-hour-weather-forecast?date_time=" + dateTime,
            json: true
        }

        request(options).then(function (response) {

            forecasts = response.items[0].forecasts
            area_metadata = response.area_metadata

            // Store the area and forecast of first distance comparison
            shortest_distance = computeDistance(lat, lng, area_metadata[0].label_location.latitude, area_metadata[0].label_location.longitude)
            var area = forecasts[0].area
            var area_forecast = forecasts[0].forecast

            for (var i = 0; i < forecasts.length; i++) {

                distance = computeDistance(lat, lng, area_metadata[i].label_location.latitude, area_metadata[i].label_location.longitude)

                if (distance < shortest_distance) {
                    shortest_distance = distance
                    area = forecasts[i].area
                    area_forecast = forecasts[i].forecast
                }

            }

            isRaining = (area_forecast.toLowerCase().includes("showers") || area_forecast.toLowerCase().includes("rain"))

            resolve(isRaining)

        })

    }).catch(err => {
        console.log(err)
    })
}

// Compute difference in latlng
function computeDistance(lat1, lon1, lat2, lon2) {
    R = 6371e3;
    dLat = (lat2 - lat1) * Math.PI / 180;
    dLon = (lon2 - lon1) * Math.PI / 180;
    a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;

    return R * 2 * Math.asin(Math.sqrt(a));
}

// Get the general 24hours weather of regions in singapore
exports.get24hrWeather = function () {
    return new Promise(function (resolve, reject) {

        today = new Date()

        month = ("0" + (today.getMonth() + 1)).slice(-2)
        date = ("0" + today.getDate()).slice(-2)

        hours = ("0" + today.getHours()).slice(-2)
        min = ("0" + today.getMinutes()).slice(-2)
        seconds = ("0" + today.getSeconds()).slice(-2)

        wholedate = today.getFullYear() + '-' + month + '-' + date
        time = hours + "%3A" + min + "%3A" + seconds
        dateTime = wholedate + 'T' + time
        options = {
            url: "https://api.data.gov.sg/v1/environment/24-hour-weather-forecast?date_time=" + dateTime,
            json: true
        }

        request(options).then(function (response) {

            resolve(response.items[0])

        })

    }).catch(err => {
        console.log(err)
    })
}