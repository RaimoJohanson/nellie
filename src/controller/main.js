'use strict';
var request = require('request');

module.exports = function(app) {
  var testTable = require('../model/generic')(app, 'test');
  var Main = require('../service/logic')(app);

  app.get('/data', function(req, res) {
    console.log('/data');
    Main.data(req.query).then(result => {
      res.json(result);
    }).catch(err => {
      res.json(err);
    });
  }); //end of app.get



  app.post('/data', (req, res) => {
    Main.addData(req.body).then(result => {
      res.json(result);
    }).catch(err => {
      res.json(err);
    });
  });

  app.get('/feature', function(req, res) {
    Main.getFeature(req.query.id).then(result => {
      res.json(result);
    }).catch(err => {
      res.json(err);
    });
  });

  app.get('/label', function(req, res) {
    Main.getLabel(req.query.id).then(result => {
      res.json(result);
    }).catch(err => {
      res.json(err);
    });
  });

}; //end of module.exports
