const Carpark = require('../models/carpark'),
    mongoose = require('mongoose'),
    request = require('request-promise'),
    dotenv = require('dotenv').config();

let mogodb = process.env.MONGODB_URI;
if (mogodb == null || mogodb == "") {
    mogodb = "mongodb://localhost:27017/cz2006";
}
mongoose.connect(mogodb, {
    useNewUrlParser: true
})

/*
The LTA API only allow 500 records to be return per call. Hence, 
the first parameter 'records' is to determine how many records to 
SKIPPED when a request is made to LTA's API. The value of 'records' 
will be appended with the skip operator to the end of the url provided 
by LTA.

It  seem that the records return from the API exists some duplicate 
copies. Hence, it is necessary to perform some form of filtering if 
this method is to be called.
*/

function getDataFromAPI(records, callback) {
    var url = "http://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2?$skip=";
    var arr = [];
    var options = {
        url: url + records,
        headers: {
            AccountKey: process.env.LTA_API_KEY
        },
        json: true
    }

    request(options)
        .then(function (response) {
            response['value'].forEach(function (value) {
                arr.push(value);
            });
            return callback(null, arr);
        });
}

/*
This function calls the getDataFromApi function 4 times to store
all the carparks into an array and returns that array
*/
function storeAPIDataInArray(callback) {
    var fullCarparkList = [];
    var record = 0;
    getDataFromAPI(record, function (err, data) {
        if (!err) {
            data.forEach(function (data) {
                fullCarparkList.push(data);
            });

            record += 500;
            getDataFromAPI(record, function (err, data) {
                if (!err) {
                    data.forEach(function (data) {
                        fullCarparkList.push(data);
                    });
                    record += 500;
                    getDataFromAPI(record, function (err, data) {
                        if (!err) {
                            data.forEach(function (data) {
                                fullCarparkList.push(data);
                            });
                            record += 500;
                            getDataFromAPI(record, function (err, data) {
                                if (!err) {
                                    data.forEach(function (data) {
                                        fullCarparkList.push(data);
                                    })
                                    callback(fullCarparkList)
                                }
                            });

                        }
                    });
                }
            });
        }
    });
}


/*
This function takes in a parameter which is the carpark id.
A flag will be return which indicates true or false where true
indicate that that carpark queried has more than 5 available lots.
Where false represent the opposite, meaning lesser than 5.
*/

exports.checkSingleLot = function (carparkID, callback) {

    var result = [{available_lots: 0, sendpush: false }]
    storeAPIDataInArray(function (fullCarparkList) {

        for (let fCarpark of fullCarparkList) {
            //Checks the current avail slots for the partial carpark list if avail slots < 5
            // if available slots less than 5, send client a push notification
            if (fCarpark['CarParkID'] === carparkID && fCarpark['AvailableLots'] < 100 && fCarpark['AvailableLots'] > 0) {
                result = [{
                    available_lots: fCarpark['AvailableLots'],
                    sendpush: true
                }]
                break

            } else if (fCarpark['CarParkID'] === carparkID && fCarpark['AvailableLots'] > 0) {

                result = [{
                    available_lots: fCarpark['AvailableLots'],
                    sendpush: false
                }]

                break
            }
        };

        // Return false + number of slots if current avail slots for carpark >=5
        // Return true + number of slots  if current avail slots for carpark < 5
        callback(null, result)
    })

}

/*
The design of our implementation is to maintain a list of carparks
that was computed/derived upon the submission of user's desired
destination. The reason is to lesser the space and time complexity.

This function will call the LTA API, retrieved all available records, 
match the records to the current list maintained and update the respective
availability for each of the carpark.
*/

exports.checkCurrentLots = function (partialCarparkList, callback) {
    var currLots = [];
    var temp = [];
    storeAPIDataInArray(function (fullCarparkList) {

        partialCarparkList.forEach(function (pCarpark) {
            fullCarparkList.forEach(function (fCarpark) {
                //Checks the current avail slots for the partial carpark list if avail slots > 4
                if (fCarpark['CarParkID'] === pCarpark['id'] && fCarpark['AvailableLots'] > 4) {

                    if (fCarpark['LotType'] == "C")
                        LotType = "Cars"
                    else if (fCarpark['LotType'] == "H")
                        LotType = "Heavy Vehicles"
                    else
                        LotType = "Motorcycles"

                    var arr = fCarpark['Location'].split(" ");

                    var carpark = {
                        id: fCarpark['CarParkID'],
                        development: fCarpark['Development'],
                        lat: arr[0],
                        long: arr[1],
                        available_lots: fCarpark['AvailableLots'],
                        lot_type: LotType,
                        distance: pCarpark['distance'],
                        agency: fCarpark['Agency']
                    }

                    currLots.push(carpark);
                }

            });

        });

        //Removing duplicates
        currLots = currLots.filter((x, i) => {
            if (temp.indexOf(x.id) < 0) {
                temp.push(x.id);
                return true;
            }
            return false;
        });

        //Filter carpark list array then return array that's sorted by distance ASC order
        callback(null, currLots.sort(function (x, y) {
            return x.distance - y.distance;
        }));

    })

}

function computeDistance(lat1, lon1, lat2, lon2) {
    var R = 6371e3;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;

    return R * 2 * Math.asin(Math.sqrt(a));
}

exports.populateCarparkList = function () {
    var arr = [];
    var record = 0;

    getDataFromAPI(record, function (err, data) {
        if (!err) {
            data.forEach(function (data) {
                arr.push(data);
            });
            record += 500;
            getDataFromAPI(record, function (err, data) {
                if (!err) {
                    data.forEach(function (data) {
                        arr.push(data);
                    });
                    record += 500;
                    getDataFromAPI(record, function (err, data) {
                        if (!err) {
                            data.forEach(function (data) {
                                arr.push(data);
                            });
                            record += 500;
                            getDataFromAPI(record, function (err, data) {
                                if (!err) {
                                    data.forEach(function (data) {
                                        arr.push(data);
                                    });

                                    arr.forEach(function (carpark) {

                                        Carpark.updateOne({
                                                "id": carpark['CarParkID']
                                            }, {
                                                $set: {
                                                    "id": carpark['CarParkID'],
                                                    "development": carpark['Development'],
                                                    "location": carpark['Location'],
                                                    "lot_type": carpark['LotType']
                                                }
                                            }, {
                                                upsert: true
                                            })
                                            .then((result) => {
                                                console.log('Updated - ' + result);

                                            }).catch((err) => {
                                                console.log('Error: ' + err);
                                            });

                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

exports.getCarparkList = function (lat, lon, callback) {

    Carpark.find({}, function (err, data) {
        if (err) {
            //handle error
            callback(err, null);
        } else {
            var list = [];

            data.forEach(function (carpark) {
                var arr = carpark['location'].split(" ");
                var distance = computeDistance(lat, lon, arr[0], arr[1]);
                var newcarpark = {
                    id: carpark['id'],
                    development: carpark['development'],
                    location: carpark['location'],
                    lot_type: carpark['lot_type'],
                    distance: distance.toFixed(2)
                }
                if (distance < 1000) {
                    list.push(newcarpark);
                }
            });

            callback(null, list);
        }
    });
}