const express = require('express'),
  router = express.Router(),
  FCM = require('fcm-push'),
  dotenv = require('dotenv').config();

const carparkController = require('../controllers/carpark-controller');


router.get('/viewroute', function (req, res) {
  res.render('viewroute', { page: 'View Route' });
});

router.get('/checkCurrAvail', async function (req, res) {
  req.session.deviceToken = req.query.deviceToken;
  var routeDuration = req.query.routeDuration;
  var start_time = new Date();
  var end_time = new Date(start_time.getTime() + (routeDuration * 1000));

  checkCurrAvail(req, end_time)
    .then(function (result) {
    
      if (result[0].sendpush) {
      sendPush(req, result);
      res.send('Success');
       } else {
        res.send('End');
       }
    }).catch(err => {
      console.log(err);
    });

});

router.post('/viewroute', function (req, res) {
  if (!req.body) return res.sendStatus(400)
  if (!req.body.url) {
    req.session.carparkID = req.body.id;
    req.session.desLat = req.body.lat;
    req.session.desLng = req.body.long;

    res.render('viewroute', { page: 'View Route', currLat: req.session.currLat, currLng: req.session.currLng, desLat: req.session.desLat, desLng: req.session.desLng });
  } else {
    res.redirect(req.body.url);
  }

});

// Calls the function to check the LTA api and determines whether to rerun function or stop 
function checkCurrAvail(req, end_time) {
  return new Promise(function cb(resolve, reject) {
    // Run the check for the duration of the route
 
    checkAPI(req).then(function (result) {
      start_time = new Date();
      if (start_time.getTime() < end_time.getTime()) {
        // sendpush = true Availbility is below threshold, send notification
        if (result[0].sendpush) {
          console.log('Current availability: ' + result[0].available_lots + ', sending notificaion. - ' + new Date().toLocaleTimeString());
          resolve(result);

        } else {
          // sendpush = false Availbility is above threshold, continue checking
          console.log('Current availability: ' + result[0].available_lots + ', continue checking. - ' + new Date().toLocaleTimeString());
          return delay(50000).then(function () {
            checkCurrAvail(req, end_time);
          });
        }
      } else {

        console.log('Session has ran for the route\'s duration, stopping check.');
        resolve(null);
      }
    }).catch(err => {

      return delay(50000).then(function () {
        checkCurrAvail(req, end_time);
      });
    });

  })
}

// Checks the LTA api for the current availability of specific carpark
function checkAPI(req) {
  return new Promise(function (resolve, reject) {
    carparkController.checkSingleLot(req.session.carparkID, function (err, result) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(result);
      }
    })
  })
};

// Promise delay function for delaying functions
function delay(t, v) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t)
  });
}

// Send a push notification to device
function sendPush(req, results) {
  var fcm = new FCM(process.env.FCM_SERVER_KEY);
  var message = {
    to: req.session.deviceToken,
    notification: {
      title: 'Carpark Nav',
      body: "The carpark you've selected has " + results[0].available_lots + " slots left. Click to select new carpark.",
      icon: '/favicon.ico'
    }
  };

  fcm.send(message)
    .then(function (response) {
      console.log("Successfully sent push notification at - " + new Date().toLocaleTimeString());
    })
    .catch(function (err) {
      console.error(err);
    })
}

module.exports = router;