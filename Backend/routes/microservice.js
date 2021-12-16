const express = require('express');
const router = express.Router();
const microservice = require('../services/microservice')

router.get('/getmicroservicedata/:applicationId', microservice.fetchMicroserviceData);
router.get('/getapplications/:companyId',microservice.fetchApplications);
router.get('/getmicroservicehistory/:microserviceId',microservice.fetchMicroserviceHistory);

module.exports = router;