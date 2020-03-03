var map;
var mapData = [];
var startmarkerwindow;
var endmarkerwindow;
var infowindow;
var polylines = [];
var shadows = [];
var bounds;
var routeDuration = 0;

// Pull lat and long of start and end to render map
// Then remove it from html
var desLat = JSON.parse($('#desLat').text());
$('#desLat').remove();
var desLng = JSON.parse($('#desLng').text());
$('#desLng').remove();
var currLat = JSON.parse($('#currLat').text());
$('#currLat').remove();
var currLng = JSON.parse($('#currLng').text());
$('#currLng').remove();

function initMap() {

  var directionsService = new google.maps.DirectionsService;
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 9,
    mapTypeControl: false,
    center: { lat: currLat, lng: currLng }
  });
  calculateRoute(directionsService);
  // get the bounds of the polyline
  google.maps.Polyline.prototype.getBounds = function (startBounds) {
    if (startBounds) {
      bounds = startBounds;
    }
    else {
      bounds = new google.maps.LatLngBounds();
    }
    this.getPath().forEach(function (item, index) {
      bounds.extend(new google.maps.LatLng(item.lat(), item.lng()));
    });
    return bounds;
  };

  
}

// Function to create a marker containing the address for start and end points 
function createMarker(start_address, start_location, end_address, end_location) {
  startmarkerwindow = new google.maps.InfoWindow({
    content: '' + start_address
  });
  endmarkerwindow = new google.maps.InfoWindow({
    content: '' + end_address
  });

  var startmarker = new google.maps.Marker({
    position: start_location,
    map: map,
    animation: google.maps.Animation.DROP,
    icon: "http://maps.google.com/mapfiles/marker" + 'A' + ".png"
  });

  var endmarker = new google.maps.Marker({
    position: end_location,
    map: map,
    animation: google.maps.Animation.DROP,
    icon: "http://maps.google.com/mapfiles/marker" + 'B' + ".png"
  });


  //Show address of marker on click
  startmarker.addListener('click', function () {
    startmarkerwindow.open(map, startmarker);
  });

  endmarker.addListener('click', function () {
    endmarkerwindow.open(map, endmarker);
  });
  startmarker.setMap(map);
  endmarker.setMap(map);
}

// Calculate and create routes
function calculateRoute(directionsService) {
  var request = {
    origin: { lat: currLat, lng: currLng },
    destination: { lat: desLat, lng: desLng },
    provideRouteAlternatives: true,
    optimizeWaypoints: true,
    travelMode: google.maps.TravelMode['DRIVING']
  };
  directionsService.route(request, function (response, status) {

    // Clear previous polylines
    for (var data in polylines) {
      polylines[data].setMap(null);
      shadows[data].setMap(null);
    }
    polylines = [];
    shadows = [];
    mapData = [];
    if (status === 'OK') {
      var bounds = new google.maps.LatLngBounds();
      for (var i in response.routes) {
        // Highlight first suggested route
        var hide = (i == 0 ? false : true);
        var shadow = renderPolylineShadow(response.routes[i].overview_path, '#666666');
        var line = renderPolyline(response.routes[i].overview_path, '#0080ff', hide);
        if (!hide) {
          createMarker(response.routes[i].legs[0].start_address, response.routes[i].legs[0].start_location, response.routes[i].legs[0].end_address, response.routes[i].legs[0].end_location);
        }
        polylines.push(line);
        shadows.push(shadow);
        // Route's data stored in array for info window
        mapData.push({
          distance: response.routes[i].legs[0].distance,
          duration: response.routes[i].legs[0].duration
        });
        // Assign longest duration to routeDuration for use in pushNotification.js
        if (routeDuration < response.routes[i].legs[0].duration.value)
          routeDuration = response.routes[i].legs[0].duration.value;
          
        bounds = line.getBounds(bounds);
        google.maps.event.addListener(shadow, 'click', function (e) {
          // Detect which route was clicked on
          var index = shadows.indexOf(this);
          highlightRoute(index, e);
        });

      }

      map.fitBounds(bounds);
    }
  });
}

// Highlight a route
function highlightRoute(index, e) {
  for (var route in polylines) {
    if (route == index) {

      polylines[route].setMap(map);

      // Info window of route
      var contentString =
        '<span>Distance: ' + mapData[route].distance.text + '</span><br/>' +
        '<span>Duration: ' + mapData[route].duration.text + '</span><br/>' +
        '';

      if (e) {
        var position = new google.maps.LatLng(e.latLng.lat(), e.latLng.lng());
        // Close previous info window
        if (infowindow) {
          infowindow.close();
          infowindow = null;
        }
        infowindow = new google.maps.InfoWindow({
          content: contentString,
          position: position,
          map: map
        });
      }
    }
    else {
      polylines[route].setMap(null);
    }
  }
}

// Draws polyline for the first route only
function renderPolyline(mapPath, lineColor, hide) {
  var polyline = new google.maps.Polyline({
    path: mapPath,
    strokeColor: lineColor,
    strokeOpacity: 1,
    strokeWeight: 4
  });
  if (!hide) {
    polyline.setMap(map);
  }
  return polyline;
}

// Draws polyline shadow for routes other than the first
function renderPolylineShadow(mapPath, lineColor, hide) {
  var polyline = new google.maps.Polyline({
    path: mapPath,
    strokeColor: lineColor,
    strokeOpacity: 0.5,
    strokeWeight: 6
  });
  if (!hide) {
    polyline.setMap(map);
  }
  return polyline;
}

// Return routeDuration to caller

function getrouteDuration() {
  return routeDuration;
}



