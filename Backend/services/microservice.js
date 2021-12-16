const logger = require('tracer').colorConsole();
const _ = require('lodash');
const createError = require('http-errors');
const mongoose = require('mongoose');
const application = require('../db/schema/application').createModel();
const failureLogDetails = require('../db/schema/cuurentFailureLogDetails').createModel();
const failureLogDetailsHistory = require('../db/schema/failureLogHistory').createModel();
const microservice = require('../db/schema/microservice').createModel();
const operations = require('../db/operations');

const fetchMicroserviceData = async (request, response) => {
    try {
        let microServices = await operations.findDocumentsByQuery(microservice, { applicationId: request.params.applicationId })
        let MicroserviceData = []
        for (var element in microServices) {
            logger.log(microServices[element])
            var status = true
            var dependencies = microServices[element].dependencies
            let microServiceStatus = await operations.findDocumentsByQuery(failureLogDetails, { failedMicroservice: microServices[element]._id })
            if (microServiceStatus.length) {
                status = "false"
            } else {
                status = "true"
            }
            MicroserviceData.push({
                data: {
                    id: microServices[element].name,
                    label: microServices[element].name,
                    success: status,
                    _id: microServices[element]._id
                }
            })

            for (var dependency in dependencies) {
                MicroserviceData.push({
                    data: {
                        source: microServices[element].name,
                        target: dependencies[dependency],
                        label: `${dependencies[dependency]} is dependent on ${microServices[element].name}`
                    }
                })
            }
        };
        return response.status(200).json( MicroserviceData );

    } catch (ex) {
        logger.error(ex);
        const message = ex.message ? ex.message : 'Error while fetching application data';
        const code = ex.statusCode ? ex.statusCode : 500;
        return response.status(code).json({ message });
    }
};


const fetchApplications = async (request, response) => {
    try {
        console.log(request);

        let applications = await operations.findDocumentsByQuery(application, { companyId: request.params.companyId })

        let applicationData = []

        for (var app in applications) {
            let microServices = await operations.findDocumentsByQuery(microservice, { applicationId: applications[app]._id })

            let MicroserviceData = []

            for (var element in microServices) {
                logger.log(applications[element])
                var status = true
                var dependencies = microServices[element].dependencies
                let microServiceStatus = await operations.findDocumentsByQuery(failureLogDetails, { failedMicroservice: microServices[element]._id })
                if (microServiceStatus.length) {
                    status = false
                } else {
                    status = true
                }
                MicroserviceData.push({
                        name: microServices[element].name,
                        _id: microServices[element]._id,
                        success: status
                    })
            }
            applicationData.push({_id:applications[app]._id,
                                name:applications[app].name,
                                key:applications[app].key,
                                microServicesdetails:MicroserviceData})
        };

        logger.log(applicationData)

        return response.status(200).json(applicationData);

    } catch (ex) {
        logger.error(ex);
        const message = ex.message ? ex.message : 'Error while fetching applications for company';
        const code = ex.statusCode ? ex.statusCode : 500;
        return response.status(code).json({ message });
    }
};

const fetchMicroserviceHistory= async (request, response) => {
    try {
        console.log(request);

            let microService = await operations.findDocumentsByQuery(microservice, { _id: request.params.microserviceId })

            let microServiceStatus = await operations.findDocumentsByQuery(failureLogDetails, { failedMicroservice: request.params.microserviceId })

            let microServiceHistory = await operations.findDocumentsByQuery(failureLogDetailsHistory, {failedMicroservice: request.params.microserviceId})

            microServiceHistory1 =  _.chain(microServiceHistory).groupBy("failedApi").map((value, key) => ({ name: key, history: value })).value()

            
        return response.status(200).json({microServiceDetails:microService,currentStatus:microServiceStatus,history:microServiceHistory1});

    } catch (ex) {
        logger.error(ex);
        const message = ex.message ? ex.message : 'Error while fetching microservice history';
        const code = ex.statusCode ? ex.statusCode : 500;
        return response.status(code).json({ message });
    }
};

module.exports.fetchMicroserviceData = fetchMicroserviceData;
module.exports.fetchApplications = fetchApplications;
module.exports.fetchMicroserviceHistory = fetchMicroserviceHistory;