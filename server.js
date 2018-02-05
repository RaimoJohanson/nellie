var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);

app.use(express.static('./fe'));

// load application
require('./src/app')(app);

// start server
server.listen(process.env.PORT || 8080, process.env.IP || "0.0.0.0", function() {
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});
