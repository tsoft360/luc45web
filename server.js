const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.on('join room', ({ username, room }) => {
    socket.join(room);
    socket.username = username;
    socket.room = room;
    io.to(room).emit('user joined', username);
  });

  socket.on('chat message', ({ room, user, text }) => {
    io.to(room).emit('chat message', { user, text });
  });

  socket.on('disconnect', () => {
    if (socket.room && socket.username) {
      io.to(socket.room).emit('chat message', {
        user: 'Systeem',
        text: `${socket.username} heeft de chat verlaten.`
      });
    }
  });
});

http.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});