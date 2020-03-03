function makeAjaxCall(url, token, routeDuration, methodType) {
      $.ajax({
            url: url,
            method: methodType,
            dataType: "json",
            data: {
                  routeDuration: routeDuration,
                  deviceToken: token
            },
            success: console.log('success'),
            error: function (reason, xhr) {
                  console.log("Error in processing your request", reason);
            }
      });
}

function test() {
      var routeDuration = getrouteDuration();

      messaging.getToken().then((token) => {
            makeAjaxCall('/checkCurrAvail', token, routeDuration, 'GET');
      }).catch(function (err) {
            console.log(err);
      });

};
