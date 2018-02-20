const express = require('express');
const app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.set('port', process.env.PORT || 3000);

let clients = []
server.listen(app.get('port'), function() {
  console.log('************SERVER STARTED************');
});

io.on('connection', (socket) => {
  let currentUser;

  socket.on('USER_CONNECT', () => {
    console.log('User connected');
    clients.forEach(client => {
      socket.emit('PLAYER_LOGGED', { name: client.name, position: client.position })
      console.log('User name '+ client.name+ ' is connected');
    });
  });

  socket.on('PLAY', (data) => {
    currentUser = {
      name: data.name,
      position: data.position
    }
    clients.push(currentUser);
    socket.emit('PLAY', currentUser);
    console.log('Player logged in.');
    socket.broadcast.emit('PLAYER_LOGGED', currentUser);
  });

  socket.on('MOVE', (data) => {
    currentUser.position = data.position;
    // socket.emit('MOVE', currentUser);
    socket.broadcast.emit('PLAYER_MOVED', currentUser);
    console.log(currentUser.name + ' move to ' + currentUser.position);
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected ' + currentUser.name);
    socket.broadcast.emit('USER_DISCONNECTED', currentUser);
    clients = clients.filter(client => client.name != currentUser.name);
  });

});