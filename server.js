const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Nieuwe gebruiker verbonden');

  socket.on('user joined', (username) => {
    socket.username = username;
    io.emit('user joined', username);
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      console.log(socket.username + ' is vertrokken');
    }
  });
});

http.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});