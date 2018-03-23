'use strict';

module.exports = function(app) {
  var Logic = require('../service/logic')(app);

  app.get('/api/data', (req, res, next) => {
    Logic.initSession(req.ip).then((id) => {
      res.locals.sessionID = id[0];
      next();
    }).catch(err => {
      res.status(412).json(err);
    });
  }, function(req, res) {
    Logic.data(req.query).then(result => {
      result.session_id = res.locals.sessionID;
      res.json(result);
    }).catch(err => {
      res.status(412).json(err);
    });
  }); //end of app.get

  app.post('/api/data', (req, res) => {
    Logic.addData(req.body).then(result => {
      res.json(result);
    }).catch(err => {
      console.log(err);
      res.status(412).json(err);
    });
  });
  app.post('/api/endorse', (req, res) => {
    Logic.endorseData(req.body).then(result => {
      res.json(result);
    }).catch(err => {
      console.log(err);
      res.status(412).json(err);
    });
  });
  app.get('/api/feature', function(req, res) {
    Logic.getFeature(req.query.id).then(result => {
      res.json(result);
    }).catch(err => {
      res.status(412).json(err);
    });
  });

  app.get('/api/label', function(req, res) {
    Logic.getLabel(req.query).then(result => {
      res.json(result);
    }).catch(err => {
      res.status(412).json(err);
    });
  });

  app.put('/api/session/:session_id', function(req, res) {
    Logic.updateSession(req.params.session_id, req.body).then(() => {
      res.end();
    }).catch(err => {
      res.status(412).json(err);
    });
  });

}; //end of module.exports
