const socket = io();
const chatBox = document.getElementById("chat");
const passwordInput = document.getElementById("password");
const joinBtn = document.getElementById("join");
const sendBtn = document.getElementById("send");
const messageInput = document.getElementById("message");
let currentUser = "";
let currentRoom = "";

joinBtn.onclick = () => {
  const username = document.getElementById("username").value;
  const room = document.getElementById("room").value;
  const password = passwordInput?.value || "";
  if (!username || !room) return;
  currentUser = username;
  currentRoom = room;
  socket.emit("join room", { username, room, password });
  document.getElementById("login").style.display = "none";
  document.getElementById("chatContainer").style.display = "flex";
};

sendBtn.onclick = () => {
  const text = messageInput.value;
  if (text.startsWith("/")) {
    socket.emit("admin command", { room: currentRoom, username: currentUser, command: text });
  } else {
    socket.emit("chat message", { room: currentRoom, user: currentUser, text });
  }
  messageInput.value = "";
};

socket.on("chat message", ({ user, text }) => {
  const msg = document.createElement("div");
  msg.textContent = user + ": " + text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on("user joined", (username) => {
  const msg = document.createElement("div");
  msg.textContent = `${username} is toegetreden tot de chat`;
  chatBox.appendChild(msg);
});

socket.on("clear chat", () => chatBox.innerHTML = "");
socket.on("kick", (name) => {
  if (currentUser === name) {
    alert("Je bent verwijderd uit de chat.");
    location.reload();
  }
});
socket.on("rename", ({ oldName, newName }) => {
  if (currentUser === oldName) {
    currentUser = newName;
    alert("Je naam is veranderd in " + newName);
  }
});
