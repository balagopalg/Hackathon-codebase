const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv/config');

const { logger } = require('./log/log');


const IndexRoutes = require('./routes/index')


const app = express();

const uri = "mongodb://mongodb:27017/patientdb";

app.use(bodyparser.json());

app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    })

app.use('/',IndexRoutes);
 

mongoose.connect(uri, {useNewUrlParser: true}).then(() => {
    logger.info("DB Connection successful");
    app.listen(8000,() => {
      logger.info(`Your port is 8000`);
    });
})
.catch(err => {
  logger.error(`Unable to connect to DB!!! Restarting...`);
})  


module.exports = app;
