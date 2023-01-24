var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});
io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});
server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});
//http://localhost:8081/
//'node server.js' in powershell to start server
// ctrl + c to stop server

