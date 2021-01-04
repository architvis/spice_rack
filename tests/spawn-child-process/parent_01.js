

var child = require('child_process').fork('./child_01.js');

// Open up the server object and send the handle.
var server = require('net').createServer();
console.log("start pass server test")
server.on('connection', function (socket) {
  console.log("Parent: connection")
  socket.end('handled by parent');
});
server.listen(1337, function() {
  console.log("pass socket to child")
  child.send('server', server);
}); 