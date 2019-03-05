var fs = require('fs');
var path = require('path');
module.exports = function(app) {
    //get controller contents, exclude itself
    //console.log('Requiring "controller" files');
    fs.readdirSync(__dirname).forEach(function(file) {
        if (file.substr(-3) == '.js' && file != path.basename(__filename)) {
            //console.log(file);
            require(__dirname + '/' + file)(app);
        }
    });
};
