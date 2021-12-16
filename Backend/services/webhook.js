const logger = require('tracer').colorConsole();
const _ = require('lodash');
const createError = require('http-errors');
const mongoose = require('mongoose');
const company = require('../db/schema/company').createModel();
const application = require('../db/schema/application').createModel();
const failueLogDetails = require('../db/schema/cuurentFailureLogDetails').createModel();
const failureLogDetailsHistory = require('../db/schema/failureLogHistory').createModel();
const microservice = require('../db/schema/microservice').createModel();
const operations = require('../db/operations');
var splunkjs = require('splunk-sdk');
const send = require('gmail-send')({
    user: 'notifications.applications@gmail.com',
    pass: 'Vamsi@8143',
    to: '',
    subject: 'Micro service Down',
});
mail = async (options) => {
    const { result, full } = await send(options);
    console.log(result);
}

//   const {result,full} = await send(options);
const onAlert = async (request, response) => {
    try {
        console.log(request);
        let microServiceName = JSON.parse(request.body.result._raw).message.status.split('_')[1];
        let applicationName = JSON.parse(request.body.result._raw).message.status.split('_')[0];
        let logObject = {
            searchKey: JSON.parse(request.body.result._raw).message.status,
            failedApi: JSON.parse(request.body.result._raw).message.api,
            failureTime: request.body.result._time,
            severity: JSON.parse(request.body.result._raw).severity,
            logData: {
                failureTime: request.body.result._time,
                data: JSON.parse(request.body.result._raw).message.logData
            }
        }
        await handleFailureAlert(logObject, microServiceName,applicationName);
        return response.status(200).json({ "messasge": "valid credentials" });

    } catch (ex) {
        logger.error(ex);
        const message = ex.message ? ex.message : 'Error while validating credentials';
        const code = ex.statusCode ? ex.statusCode : 500;
        return response.status(code).json({ message });
    }
};


const onSuccessAlert = async (request, response) => {
    try {
        let searchName = request.body.search_name;
        let logObject = {
            searchKey: JSON.parse(request.body.result._raw).message.status,
            failedApi: JSON.parse(request.body.result._raw).message.api,
            successTime: request.body.result._time,
            logData: {
                failureTime: request.body.result._time,
                data: JSON.parse(request.body.result._raw).message.logData
            }
        }
        let microServiceName = JSON.parse(request.body.result._raw).message.status.split('_')[1];
        let applicationName = JSON.parse(request.body.result._raw).message.status.split('_')[0];
        let failedapplication = await operations.findDocumentsByQuery(application, { name : applicationName});
        let microServiceObj = await operations.findDocumentsByQuery(microservice, { name: microServiceName , applicationId : failedapplication[0]._id });
       
        var service = new splunkjs.Service(failedapplication[0].splunk)
        service.savedSearches().fetch(function (err, firedAlertGroups) {
            if (err) {
                console.log("There was an error in fetching the alerts"); return;
            }
            var alertToDelete = firedAlertGroups.item(searchName);
            if (!alertToDelete) {
            }
            else {
                alertToDelete.remove();
                console.log("Deleted");
            }
        });
        let failiedLogData = await operations.findDocumentsByQuery(failueLogDetails, { failedMicroservice: microServiceObj[0]._id, failedApi: logObject.failedApi });
        await operations.deleteDocument(failueLogDetails, failiedLogData[0]._id);
        console.log(failiedLogData);
        let historyObj = {
            name: failiedLogData[0].name,
            failureTime: failiedLogData[0].failureTime,
            severity: failiedLogData[0].severity,
            successTime: logObject.successTime,
            failureCount: failiedLogData[0].failureCount,
            failedApi: failiedLogData[0].failedApi,
            failedMicroservice: failiedLogData[0].failedMicroservice,
            failureData: failiedLogData[0].failureData
        }
        await operations.saveDocuments(failureLogDetailsHistory, historyObj, { runValidators: true })
        return response.status(200).json({ "messasge": "done" });

    } catch (ex) {
        logger.error(ex);
        const message = ex.message ? ex.message : 'Error while validating credentials';
        const code = ex.statusCode ? ex.statusCode : 500;
        return response.status(code).json({ message });
    }
}

const handleFailureAlert = async (logObject, microServiceName,applicationName) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let searchKey = logObject.searchKey.replace('FAILURE', 'SUCCESS');
        searchKey = `${logObject.failedApi}  ${searchKey}*`;
        let failedapplication = await operations.findDocumentsByQuery(application,{ name :applicationName })
        let microServiceObj = await operations.findDocumentsByQuery(microservice, { name: microServiceName , applicationId : failedapplication[0]._id });
        let logDetails = await operations.findDocumentsByQuery(failueLogDetails, { name: searchKey }, { failureCount: 1, _id: 1 });
        if (logDetails.length) {
            let result = await operations.updateField(failueLogDetails, { _id: logDetails[0]._id }, { $set: { failureCount: logDetails[0].failureCount + 1 }, $push: { failureData: logObject.logData } });
        }
        else {
            console.log(microServiceObj);
       
            //  let appObj = await operations.findDocumentsByQuery(application, { _id: microServiceObj[0].applicationId });
            //  console.log(appObj)
             let compObj = await operations.findDocumentsByQuery(company, { _id: failedapplication[0].companyId });
            let mailObj = {
                to: compObj[0].email,
                subject: 'Micro Service Down',
                text: 'gmail-send example 1',
                html: `<div>
                ${logObject.failedApi} API is failed in Micro service ${microServiceName}
                <a href="${process.env.REACT_URL}"> Check the status of your application  </a>
                </div>`

            }
            mail(mailObj)
            let historyObj = {
                name: searchKey,
                failureTime: logObject.failureTime,
                severity: logObject.severity,
                successTime: null,
                failureCount: 1,
                failedApi: logObject.failedApi,
                failedMicroservice: microServiceObj[0]._id,
                failureData: [logObject.logData]
            }
            await operations.saveDocuments(failueLogDetails, historyObj, { runValidators: true });
           var service = new splunkjs.Service(failedapplication[0].splunk)
            await service.login();
            var alertOptions = {
                name: searchKey,
                search: searchKey,
                alert_type: 'always',
                "alert.severity": 3,
                "alert.suppress": false,
                "alert.track": "1",
                "dispatch.earliest_time": "-1h",
                "dispatch.latest_time": "now",
                "alert.expires": "365d",
                cron_schedule: '* * * * *',
                realtime_schedule: true,
                actions: 'webhook',
                is_scheduled: true,
                'action.webhook': '1',
                'action.webhook.param.url': `${process.env.WEBHOOK_SUCCESS}`,
                'action.email': false,
                'action.email.sendresults': null,
                'action.email.to': '',
                'action.populate_lookup': false,
                'action.rss': false,
                'action.script': false,
                'action.summary_index': false,
                'action.summary_index.force_realtime_schedule': '0',
                'action.webhook': '1',
                actions: 'webhook',
                'alert.digest_mode': false,
                'alert.managedBy': '',
                'alert.severity': 3,
                'alert.suppress': false,
                'alert.suppress.fields': '',
                'alert.suppress.period': '',
                'alert.track': false,
                alert_comparator: '',
                alert_condition: '',
                alert_threshold: '',
                alert_type: 'always',
                allow_skew: '0',
                auto_summarize: false,
                'auto_summarize.cron_schedule': '*/10 * * * *',
                'auto_summarize.dispatch.earliest_time': '',
                'auto_summarize.dispatch.latest_time': '',
                'auto_summarize.dispatch.time_format': '%FT%T.%Q%:z',
                'auto_summarize.dispatch.ttl': '60',
                'auto_summarize.max_concurrent': '1',
                'auto_summarize.max_disabled_buckets': 2,
                'auto_summarize.max_summary_ratio': 0.1,
                'auto_summarize.max_summary_size': 52428800,
                'auto_summarize.max_time': '3600',
                'auto_summarize.suspend_period': '24h',
                'auto_summarize.timespan': '',
                'auto_summarize.workload_pool': '',
                cron_schedule: '* * * * *',
                defer_scheduled_searchable_idxc: '1',
                description: '',
                disabled: false,
                'dispatch.auto_cancel': '0',
                'dispatch.auto_pause': '0',
                'dispatch.buckets': 0,
                'dispatch.earliest_time': 'rt',
                'dispatch.index_earliest': '',
                'dispatch.index_latest': '',
                'dispatch.indexedRealtime': null,
                'dispatch.indexedRealtimeMinSpan': '',
                'dispatch.indexedRealtimeOffset': '',
                'dispatch.latest_time': 'rt',
                'dispatch.lookups': true,
                'dispatch.max_count': 500000,
                'dispatch.max_time': 0,
                'dispatch.reduce_freq': 10,
                'dispatch.rt_backfill': false,
                'dispatch.rt_maximum_span': '',
                'dispatch.sample_ratio': '1',
                'dispatch.spawn_process': true,
                'dispatch.time_format': '%FT%T.%Q%:z',
                'dispatch.ttl': '2p',
                dispatchAs: 'owner',
            };
            let result = await service.savedSearches().create(alertOptions);
            // console.log(result);

        }
        await session.commitTransaction();
        return true;

    }

    catch (ex) {
        await session.abortTransaction();
        logger.error(ex);
        const message = ex.message ? ex.message : 'Error while validating credentials';
        const code = ex.statusCode ? ex.statusCode : 500;
        return response.status(code).json({ message });
    } finally {
        session.endSession();
    }

};

const failurePrediction = async (request, response) => {
    try {
        let appdetails = await operations.findDocumentsByQuery(application, { _id: request.params.applicationId })

        logger.debug(appdetails)
        var service = await new splunkjs.Service({
            username: appdetails[0].splunk.username,
            password: appdetails[0].splunk.password,
            scheme: appdetails[0].splunk.scheme,
            host: appdetails[0].splunk.host,
            port: appdetails[0].splunk.port
        });

        searchQuery = `search ${request.body.searchText} | timechart count | predict count`

        logger.log(new Date())

        await searchLog(service, searchQuery, '2020-04-13T23:18:59.000+00:00', (err, result) => {
            if (err) {
                throw createError(err)
            } else {
                let results = []
                logger.log(result)
                for (var element in result) {
                    if (result[element].count === null)
                        results.push(result[element])
                }
                // logger.debug(results)
                return response.status(200).json(results);
            }
        })

    } catch (ex) {
        logger.error(ex);
        const message = ex.message ? ex.message : 'Error while fetching Failure Prediction values';
        const code = ex.statusCode ? ex.statusCode : 500;
        return response.status(code).json({ message });
    }
};

let searchLog = (service, searchQuery, searchFromTime, callback) => {

    var searchParams = {
        exec_mode: "blocking",
        earliest_time: searchFromTime
    };

    service.search(
        searchQuery,
        searchParams,
        function (err, job) {
            if (err) {
                callback(err, null)
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
                        callback(err, result)
                    })
                });
            }
        }
    );
}

//   let searchresult = searchLog('search orders1 | timechart count | predict count', "2020-04-13T23:18:59.000+00:00",(err,result)=>{
//     let results = []
//     for(var element in result){
//         if (result[element].count === null)
//             results.push(result[element])
//     }
//     console.log(results)
//   }
//   )

module.exports.failurePrediction = failurePrediction;
module.exports.onAlert = onAlert;
module.exports.onSuccessAlert = onSuccessAlert;