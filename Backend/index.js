const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors({ origin: process.env.REACT_URL, credentials: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const logger = require('tracer').colorConsole();
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.REACT_URL);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.setHeader('Cache-Control', 'no-cache');
  next();
});
const connection = require('./db/connection');
const auth = require('./routes/routes')
const onboard = require('./routes/onboard');
const webhook = require('./routes/onalert');
const microserviceRoute = require('./routes/microservice');
const application = require('./db/schema/application').createModel();
const microservice = require('./db/schema/microservice').createModel();

async function initializeApplication() {
  try {
    await connection.createConnection();
    application.createCollection();
    microservice.createCollection();
    app.use(auth)
    app.use(onboard)
    app.use(webhook)
    app.use(microserviceRoute)
    app.listen(process.env.PORT || 8080, () => {
      logger.debug('App listening on port 8080');
    });
  } catch (error) {
    return Promise.reject(error.message);
  }
}

initializeApplication()
  .then((response) => logger.info("Server Running"))
  .catch(error => logger.error(`Error in Initalizing Application  : ${error}`));

module.exports = app;