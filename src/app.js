"use strict";

const bodyParser = require('body-parser');
const _ = require('lodash');
module.exports = function(app) {

  app.set('knex', require("./database"));


  app.use(function(req, res, next) {
    let whitelist = ['https://nellie-tiiger.c9users.io'];
    let origin = req.headers.origin;
    if (_.includes(whitelist, origin))
      res.setHeader('Access-Control-Allow-Origin', origin);

    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Credentials', true);

    // dont set cookie in OPTIONS REST method
    if (req.method.toLocaleLowerCase() == 'options')
      return res.send();
    else
      next();
  });
  // configure app to use bodyParser()

  // this will let us get the data from a POST
  var rawBodySaver = function(req, res, buffer, encoding) {
    if (buffer && buffer.length) req.rawBody = buffer.toString(encoding || 'utf8');
  };

  app.use(bodyParser.json({
    limit: "50mb",
    'verify': rawBodySaver
  }));
  app.use(bodyParser.urlencoded({
    limit: "50mb",
    'verify': rawBodySaver,
    extended: true
  }));
  app.use(bodyParser.raw({
    'verify': rawBodySaver,
    'type': '*/*'
  }));

  // CONTROLLERS - GENERAL
  // =============================================================================
  require('./controller/index')(app);

};
