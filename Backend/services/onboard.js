const logger = require('tracer').colorConsole();
const _ = require('lodash');
const createError = require('http-errors');
const mongoose = require('mongoose');
const application = require('../db/schema/application').createModel();
const microservice = require('../db/schema/microservice').createModel();
const operations = require('../db/operations');
var splunkjs = require('splunk-sdk');

const testConnection = async (request, response) => {
    try {
        var service = new splunkjs.Service({
            username: request.body.username,
            password: request.body.password,
            scheme: request.body.protocol,
            host: request.body.host,
            port: request.body.port

        });
        service.login(function (err, success) {
            if (err) {
                return response.status(401).json({ "messasge": "Invalid credentials" });
            }
            return response.status(200).json({ "messasge": "valid credentials" });
        })
    } catch (ex) {
        logger.error(ex);
        const message = ex.message ? ex.message : 'Error while validating credentials';
        const code = ex.statusCode ? ex.statusCode : 500;
        return response.status(code).json({ message });
    }
};

const onboardApplication = async (request, response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let { name, key, splunk, companyId, dependencies } = request.body;
        let applicationData = await operations.saveDocuments(application, { name, key, splunk, companyId }, { session })
        const applicationId = applicationData._id
        for (dependency of dependencies) {
            const microserviceInfo = {
                "name": Object.keys(dependency)[0],
                "dependencies": dependency[Object.keys(dependency)[0]],
                applicationId
            }
            await operations.saveDocuments(microservice, microserviceInfo, { session })
            var service = new splunkjs.Service(request.body.splunk)
            await service.login();
            var alertOptions = {
                name: name + ' :: Alert for ' + microserviceInfo.name,
                search: `${key}_${microserviceInfo.name}_FAILURE`,
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
                'action.webhook.param.url': process.env.WEBHOOK_FAILURE,
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
            console.log(process.env.WEBHOOK_FAILURE)
            await service.savedSearches().create(alertOptions)
        }
        await session.commitTransaction();
        return response.status(200).json(request.body);
    } catch (ex) {
        await session.abortTransaction();
        logger.error(ex);
        const message = ex.message ? ex.message : 'Error while validating credentials';
        const code = ex.statusCode ? ex.statusCode : 500;
        return response.status(code).json({ message });
    } finally {
        session.endSession();
    }
};

module.exports.testConnection = testConnection;
module.exports.onboardApplication = onboardApplication;
