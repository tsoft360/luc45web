const socket = io();

let username = "";
let room = "";

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const roomInput = document.getElementById("room");
const chatBox = document.getElementById("chat");
const loginBox = document.getElementById("login");
const roomTitle = document.getElementById("roomTitle");

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  username = usernameInput.value.trim();
  room = roomInput.value.trim();
  if (username && room) {
    loginBox.style.display = "none";
    chatBox.style.display = "block";
    roomTitle.textContent = `Chatcode: ${room}`;
    socket.emit("join room", { username, room });
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  if (text.startsWith("/")) {
    // Stuur command apart
    socket.emit("admin command", { room, username, command: text });
  } else {
    socket.emit("chat message", { room, user: username, text });
  }
  input.value = '';
});

socket.on("chat message", (msg) => {
  const item = document.createElement("li");
  item.textContent = msg.user + ": " + msg.text;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});

socket.on("user joined", (name) => {
  const item = document.createElement("li");
  item.textContent = `${name} is toegetreden tot de chat`;
  item.style.fontStyle = "italic";
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});

socket.on("clear chat", () => {
  messages.innerHTML = "";
});

socket.on("kick", (name) => {
  if (name === username) {
    alert("Je bent verwijderd uit de chat door een admin.");
    window.location.reload();
  }
});

socket.on("rename", ({ oldName, newName }) => {
  if (username === oldName) {
    username = newName;
    alert(`Je naam is veranderd naar: ${newName}`);
  }
  const item = document.createElement("li");
  item.textContent = `${oldName} heet nu ${newName}`;
  item.style.fontStyle = "italic";
  messages.appendChild(item);
});
