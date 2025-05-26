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
  if (input.value) {
    socket.emit("chat message", { room, user: username, text: input.value });
    input.value = '';
  }
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
