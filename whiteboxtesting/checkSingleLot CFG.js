exports.checkSingleLot = function (carparkID, callback) {

    var result = [{available_lots: 0, sendpush: false }]
    storeAPIDataInArray(function (fullCarparkList) {
         i = 0
        while (i < fullCarparkList.length) {        
          fCarpark = fullCarparkList[i]

            if (fCarpark['CarParkID'] === carparkID && fCarpark['AvailableLots'] < 5 && fCarpark['AvailableLots'] > 0) {
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
                i++
        }
        // Return false + number of slots if current avail slots for carpark >=5
        // Return true + number of slots  if current avail slots for carpark < 5
        callback(null, result)
    })

}