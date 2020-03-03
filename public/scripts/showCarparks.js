function makeAjaxCall(url, methodType, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(methodType, url, true);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                // console.log("xhr done successfully");
                var resp = xhr.responseText;
                var respJson = JSON.parse(resp);
                callback(respJson);
            } else {
                //  console.log("xhr failed");
            }
        } else {
            // console.log("xhr processing going on");
        }
    }
    // console.log("request sent succesfully");
}

// Displays a list of carparks sorted by asc distance and their respective carpark details
function displayCarparks(currCarparks) {
    if (currCarparks.length == 0) {
        var out = '<div class="container h-100"><div class="row h-100 justify-content-center align-items-center"><form class="col-12">';
        out += '<h2>No available carpark slots in radius. Try again.</h2><button type="button" class="btn btn-primary" onClick="window.location.href=' + "'/'" + '">Search Again</button>';
        out += '</form></div></div>';
        $('#preloader').remove();
        $('#main').empty().append(out);
    } else {
        // Avail slots < set amount. Call websocket on server to push notification

     
        var out = '<div class="container">';
        out += '<div class="card">';
        for (var data in currCarparks) {
            out += '<div class="card-header">';
            out += '<form action="/viewroute" id="navigate" method="POST">';
            out += '<input type="hidden" id="id" name="id" value="' + currCarparks[data].id + '"/>';
            out += '<input type="hidden" id="lat" name="lat" value="' + currCarparks[data].lat + '"/>';
            out += '<input type="hidden" id="long" name="long" value="' + currCarparks[data].long + '"/>'
            out += '<button type="submit" class="btn btn-link">';
            out += currCarparks[data].development + '</button> </form>';
            out += '<h6>Available Lots: <span class="badge badge-primary">' + currCarparks[data].available_lots + '</span></h6>';
            out += '<h6>Distance from destination: <span class="badge badge-primary">' + currCarparks[data].distance + 'm</span></h6>';
            out += '</div>';
            out += '<div class="d-flex flex-row flex-nowrap card-body gallery_scroller" id="gallery_scroller">';
            out += '<div class="card card-body"><p><b>Lot Type: </b>' + currCarparks[data].lot_type + "<br />";
            out += "<b>Carpark Type: </b>" + currCarparks[data].agency+ "<br />";
            out += "<b>Carpark Shelter: </b>" + (Math.round(Math.random())== 0 ? "Sheltered" : "Open-air") + "<br />";
            out += '</p></div>';
            out += '<div class="card card-body"><b>Carpark Prices:</b> <p>MON-FRI <b>before</b> 5/6 PM $' + (Math.floor(Math.random() * 100) + 50).toFixed(0)/100 + '/30min from 5pm to 7am the following day </p>';
            out += '<p>MON-FRI <b>after</b> 5/6 PM $' + (Math.floor(Math.random() * 200) + 80).toFixed(0)/100 + '/30min from 7am to 5pm</p>';
            out += '</div></div>';
        }
        out += '</div>';
        $('#preloader').remove()
        $('#main').empty().append(out)
        console.log('Latest carpark details updated at - ' + new Date().toLocaleTimeString())
    }
}

// Interval timer function using settimeout to make up for client side browser desync
function interval(func, times) {
    var interv = function (w, t) {
        return function () {
            if (typeof t === "undefined" || t-- > 0) {
                setTimeout(interv, w);
                try {
                    func.call(null)
                } catch (e) {
                    t = 0;
                    throw e.toString()
                }
            }
        }
    }(times)

    setTimeout(interv)
}

// Check the updated carpark slots availability every 1minute
interval(function () {
    console.log('Checking LTA API for latest carpark details at - ' + new Date().toLocaleTimeString())
    makeAjaxCall('/pullCarparks', 'GET', displayCarparks)

}, 60000)