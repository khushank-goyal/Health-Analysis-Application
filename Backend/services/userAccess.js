const logger = require('tracer').colorConsole();
const _ = require('lodash');
const createError = require('http-errors');
const uuid = require('shortid');
const company = require('../db/schema/company').createModel();
const operations = require('../db/operations');

const signin = async (request, response) => {
    try {
        const { email, password } = request.query;
        const resp = await operations.findDocumentsByQuery(company, { email, password }, { __v: 0 });
        if (_.isEmpty(resp)) {
            throw createError(401, 'Invalid Credentials');
        }
        return response.status(200).json(resp[0]);
    } catch (ex) {
        logger.error(ex);
        const message = ex.message ? ex.message : 'Error while fetching credentials';
        const code = ex.statusCode ? ex.statusCode : 500;
        return response.status(code).json({ message });
    }
};

const signup = async (request, response) => {
    try {
        const { email, password, name } = request.body;
        const data = {
            name, email, password
        };
        const resp = await operations.findDocumentsByQuery(company, { email }, { _id: 0, __v: 0 })
        if (resp.length === 1) {
            throw createError(409, 'Email Id already registered. Try logging in');
        }
        await operations.saveDocuments(company, data, { runValidators: true })

        return response.status(200).json({ message: 'Signup Successful' });
    } catch (error) {
        logger.error(JSON.stringify(error));
        const message = error.message ? error.message : 'Error Ocurred at Server';
        const code = error.statusCode ? error.statusCode : 500;
        return response.status(code).json({ message }).status(code);
    }
};

module.exports.signin = signin;
module.exports.signup = signup;