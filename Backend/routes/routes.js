const express = require('express');
const router = express.Router();
const userAccess = require('../services/userAccess')

router.get('/signin', userAccess.signin)
router.post('/signup', userAccess.signup)

module.exports = router;
