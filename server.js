const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

const PORT = process.env.PORT || 3000;
app.use(express.static("public"));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public/index.html")));

const rooms = {};
const bannedUsers = {};
const ADMIN_PASSWORD = "geheim123";

io.on("connection", (socket) => {
  // join room
  socket.on("join room", ({ username, room, password }) => {
    socket.join(room);
    socket.username = username;
    socket.room = room;

    if (!rooms[room]) rooms[room] = { users: {}, admins: [] };
    rooms[room].users[socket.id] = username;

    // Alleen toevoegen als correct wachtwoord
    if (password === ADMIN_PASSWORD) {
      rooms[room].admins.push(username);
    }

    io.to(room).emit("user joined", username);
  });

  // chat bericht
  socket.on("chat message", ({ room, user, text }) => {
    io.to(room).emit("chat message", { user, text });
  });

  // admin command
  socket.on("admin command", ({ room, username, command }) => {
    if (!rooms[room]?.admins.includes(username)) return; // niet-admin mag niet

    const parts = command.split(" ");
    const cmd = parts[0];
    const arg = parts[1];

    switch (cmd) {
      case "/ban":
        if (!bannedUsers[room]) bannedUsers[room] = [];
        bannedUsers[room].push(arg);
        io.to(room).emit("chat message", { user: "Systeem", text: `${arg} is verbannen.` });
        break;
      case "/kick":
        for (let [id, name] of Object.entries(rooms[room].users)) {
          if (name === arg) {
            io.to(id).emit("kick", arg);
            break;
          }
        }
        break;
      case "/clear":
        io.to(room).emit("clear chat");
        break;
      case "/rename":
        const newName = parts[2];
        for (let [id, name] of Object.entries(rooms[room].users)) {
          if (name === arg) {
            rooms[room].users[id] = newName;
            io.to(id).emit("rename", { oldName: arg, newName });
            break;
          }
        }
        break;
    }
  });

  // disconnect
  socket.on("disconnect", () => {
    const room = socket.room;
    if (rooms[room]) {
      delete rooms[room].users[socket.id];
    }
  });
});

http.listen(PORT, () => console.log("Server draait op poort " + PORT));
