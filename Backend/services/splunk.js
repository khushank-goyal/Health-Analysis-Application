var splunkjs = require('splunk-sdk');

var service = new splunkjs.Service({
  username: "rakeshranjan", password: "rakeshranjan", scheme: "https",
  host: "35.235.118.212",
  port: "8089"

});
service.login(function (err, success) {
  if (err) {
    throw err;
  }

  console.log("Login was successful: " + success);
  var alertOptions = {
    name: "My Awesome Alert1",
    search: "index=_internal error sourcetype=splunkd* | head 10",
    "alert_type": "always",
    "alert.severity": "2",
    "alert.suppress": "0",
    "alert.track": "1",
    "dispatch.earliest_time": "-1h",
    "dispatch.latest_time": "now",
    "is_scheduled": "1",
    "cron_schedule": "* * * * *",
    actions: 'webhook',
    'action.webhook': '1',
    'action.webhook.param.url': 'http://google.com',
  
  };
  service.savedSearches().create(alertOptions, function (err, alert) {
    if (err && err.status === 409) {
      console.error("ERROR: A saved search/report with the name '" + alertOptions.name + "' already exists");
      return;
    }
    else if (err) {
      console.error("There was an error creating the saved search/report:", err);

      return;
    }
    console.log("Created saved search/report as alert: " + alert.name);
  });

  
  service.savedSearches().fetch(function (err, savedSearches) {
    var firedAlertGroups = savedSearches.list();
    for (var a in firedAlertGroups) {
      if (firedAlertGroups.hasOwnProperty(a)) {
        var firedAlertGroup = firedAlertGroups[a];
        console.log(firedAlertGroup.name)
        console.log(firedAlertGroup._properties)
      }
    }
  });
});