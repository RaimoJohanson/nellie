'use strict';

module.exports = function(app) {
    var Logic = require('../service/logic')(app);

    app.get('/api/admin', function(req, res) {
        res.json('howdy');
    });

}; //end of module.exports
