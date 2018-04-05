'use strict';

module.exports = function(app) {
    var Logic = require('../service/logic')(app);
    var Stats = require('../service/stats')(app);

    app.get('/api/admin', function(req, res) {
        Stats.dataset().then((result) => {
            res.json(result);
        }).catch(err => {
            res.status(412).json(err);
        });
    });

    app.get('/api/admin/session/:session_id', function(req, res) {
        Stats.sessionData(req.params.session_id).then((result) => {
            res.json(result);
        }).catch(err => {
            res.status(412).json(err);
        });
    });

    app.post('/api/feedback/:session_id', function(req, res) {
        Logic.feedback(req.params.session_id, req.body).then(() => {
            res.end();
        }).catch(err => {
            res.status(412).json(err);
        });
    });

}; //end of module.exports
