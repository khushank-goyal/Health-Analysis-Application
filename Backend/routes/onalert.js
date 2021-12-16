const express = require('express');
const router = express.Router();
const webhook = require('../services/webhook')

router.post('/onalert', webhook.onAlert);

router.post('/onsuccessalert', webhook.onSuccessAlert);

router.post('/predictfailure/:applicationId',webhook.failurePrediction);

module.exports = router;
