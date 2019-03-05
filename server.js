var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);

app.use(express.static('./fe'));

require('./src/app')(app);

server.listen(process.env.PORT || 8080, process.env.IP || "0.0.0.0", function() {

  console.log("Server listening at", server.address().address + ":" + server.address().port);
});
