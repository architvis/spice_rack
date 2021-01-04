process.on('message', function(m, server) {
  console.log("Child: got message")
  if (m === 'server') {
    server.on('connection', function (socket) {
      console.log("Child: connection")
      socket.end('handled by child');
    });
  }
});