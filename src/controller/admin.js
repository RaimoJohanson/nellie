'use strict';

module.exports = function(app) {
    var Logic = require('../service/logic')(app);

    app.get('/api/admin', function(req, res) {
        res.json('howdy');
    });

    app.post('/api/feedback/:session_id', function(req, res) {
        Logic.feedback(req.params.session_id, req.body).then(() => {
            res.end();
        }).catch(err => {
            res.status(412).json(err);
        });
    });

}; //end of module.exports
