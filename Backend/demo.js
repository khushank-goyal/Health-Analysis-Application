var splunkjs = require('splunk-sdk');
var fetch = require('fetch')

var service = new splunkjs.Service({
    username: "rakeshranjan", password: "rakeshranjan",
    scheme: "https",
    host: "35.235.118.212",
    port: "8089"
  });
  
  
  var config = {
    token: "7a6849fc-bd98-4e54-9a95-839e73333392",
    url: "https://35.235.118.212:8088"
  
  };

let searchLog = (searchQuery, searchFromTime,callback) => {

    var searchParams = {
      exec_mode: "blocking",
      earliest_time: searchFromTime
    };
  
    service.search(
      searchQuery,
      searchParams,
      function (err, job) {
        if (err) {
          callback(err,null)
        } else {
          job.fetch(function (err) {
            job.results({}, function (err, results) {
                // console.log(results)
              let result = []
              var fields = results.fields;
              var rows = results.rows;
              for (var i = 0; i < rows.length; i++) {
                var values = rows[i];
                let row = {}
                for (var j = 0; j < values.length; j++) {
                  row[fields[j]] = values[j]
                }
                result.push(row)
              }
              callback(err,result)
            })
          });
        }
      }
    );
  }
  
  let searchresult = searchLog('search orders1 | timechart count | predict count', "2020-04-13T23:18:59.000+00:00",(err,result)=>{
    let results = []
    for(var element in result){
        if (result[element].count === null)
            results.push(result[element])
    }
    console.log(results)
  }
  )