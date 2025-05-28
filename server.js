const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

const ADMIN_PASSWORD = "geheim123";

const users = {};
const bannedUsers = {};

io.on("connection", (socket) => {
  socket.on("join room", ({ username, room, password }) => {
    if (username === "admin" && password !== ADMIN_PASSWORD) {
      socket.emit("chat message", {
        user: "Systeem",
        text: "Ongeldig admin-wachtwoord."
      });
      return;
    }

    if (!bannedUsers[room]) bannedUsers[room] = [];
    if (bannedUsers[room].includes(username)) {
      socket.emit("chat message", {
        user: "Systeem",
        text: "Je bent verbannen uit deze chat."
      });
      return;
    }

    socket.join(room);
    users[socket.id] = { username, room };
    io.to(room).emit("user joined", username);
  });

  socket.on("chat message", ({ room, user, text }) => {
    io.to(room).emit("chat message", { user, text });
  });

  socket.on("admin command", ({ room, username, command }) => {
    if (username !== "admin") return;
    const parts = command.trim().split(" ");
    const cmd = parts[0];
    const arg = parts[1];

    switch (cmd) {
      case "/clear":
        io.to(room).emit("clear chat");
        break;
      case "/kick":
        if (!arg) return;
        for (const [id, userInfo] of Object.entries(users)) {
          if (userInfo.room === room && userInfo.username === arg) {
            io.to(id).emit("kick", arg);
            break;
          }
        }
        break;
      case "/ban":
        if (!arg) return;
        if (!bannedUsers[room]) bannedUsers[room] = [];
        bannedUsers[room].push(arg);
        for (const [id, userInfo] of Object.entries(users)) {
          if (userInfo.room === room && userInfo.username === arg) {
            io.to(id).emit("kick", arg);
            break;
          }
        }
        io.to(room).emit("chat message", {
          user: "Systeem",
          text: `${arg} is verbannen uit de chat.`
        });
        break;
      case "/rename":
        if (!arg) return;
        for (const [id, userInfo] of Object.entries(users)) {
          if (userInfo.room === room && userInfo.username !== "admin") {
            const oldName = userInfo.username;
            users[id].username = arg;
            io.to(id).emit("rename", { oldName, newName: arg });
            break;
          }
        }
        break;
      case "/help":
        io.to(room).emit("chat message", {
          user: "Systeem",
          text: "Beschikbare commando's: /clear, /kick [naam], /ban [naam], /rename [naam], /help"
        });
        break;
    }
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
  });
});

http.listen(PORT, () => {
  console.log("Server draait op poort " + PORT);
});
