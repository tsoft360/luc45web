const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Nieuwe gebruiker verbonden');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Gebruiker heeft de verbinding verbroken');
  });
});

http.listen(3000, () => {
  console.log('Server draait op http://localhost:3000');
});