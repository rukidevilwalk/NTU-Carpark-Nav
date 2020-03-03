exports.checkCurrentLots = function (partialCarparkList, callback) {
     currLots = temp = []
    i = 0
    storeAPIDataInArray(function (fullCarparkList) {

        while (i < partialCarparkList.length) {    
            j = 0
            while (j < fullCarparkList.length) {    
             pCarpark = partialCarparkList[i]; fCarpark = fullCarparkList[j];
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
                    j++
            }
                    i++
        }

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