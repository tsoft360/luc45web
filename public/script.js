const socket = io();
const chatBox = document.getElementById("chat");
const passwordInput = document.getElementById("password");
const joinBtn = document.getElementById("join");
const sendBtn = document.getElementById("send");
const leaveBtn = document.getElementById("leaved");
const messageInput = document.getElementById("message");

let currentUser = "";
let currentRoom = "";
let currentRole = "user"; // standaardrol

leaveBtn.onclick = () => { 
  if (!currentRoom) return;

  socket.emit("leave room", { username: currentUser, room: currentRoom });
  
  // Reset de lokale status
  currentRoom = "";
  document.getElementById("chatContainer").style.display = "none";
  document.getElementById("login").style.display = "flex";
  chatBox.innerHTML = "";

  appendSystemMessage("Je hebt de chat verlaten.");
}

// Inloggen / joinen van een room
joinBtn.onclick = () => {
  const username = document.getElementById("username").value.trim();
  const room = document.getElementById("room").value.trim();
  const password = passwordInput ? passwordInput.value.trim() : "";

  if (!username || !room) {
    alert("Vul een gebruikersnaam en kamer in.");
    return;
  }

  // Als gebruiker 'admin' heet, vragen we een wachtwoord
  if (username.toLowerCase() === "admin" && !password) {
    alert("Admin moet een wachtwoord invoeren.");
    return;
  }

  currentUser = username;
  currentRoom = room;
  currentRole = username.toLowerCase() === "admin" ? "admin" : "user";

  socket.emit("join room", { username, room, password, role: currentRole });

  document.getElementById("login").style.display = "none";
  document.getElementById("chatContainer").style.display = "flex";
};

// Bericht verzenden
sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (!text) return;

  // Alleen admins mogen commands sturen
  if (text.startsWith("/") && currentRole === "admin") {
    socket.emit("admin command", {
      room: currentRoom,
      username: currentUser,
      command: text
    });
  } else if (text.startsWith("/") && currentRole !== "admin") {
    appendSystemMessage("Alleen admins mogen commando’s gebruiken.");
  } else {
    socket.emit("chat message", {
      room: currentRoom,
      user: currentUser,
      text
    });
  }

  messageInput.value = "";
};

// Bericht ontvangen
socket.on("chat message", ({ user, text }) => {
  appendMessage(`${user}: ${text}`);
});

// Iemand is toegetreden
socket.on("user joined", (username) => {
  appendSystemMessage(`${username} is toegetreden tot de chat`);
});

// Chat leegmaken
socket.on("clear chat", () => {
  chatBox.innerHTML = "";
});

// Gekickt worden
socket.on("kick", (name) => {
  if (currentUser === name) {
    alert("Je bent verwijderd uit de chat.");
    location.reload();
  }
});

socket.on("leaved", (name) => {
  if (currentUser === name) {
    location.reload();
  }
});

// Naam veranderd
socket.on("rename", ({ oldName, newName }) => {
  if (currentUser === oldName) {
    currentUser = newName;
    alert("Je naam is veranderd in " + newName);
  }
});

// Handige functies voor consistent berichtformaat
function appendMessage(text) {
  const msg = document.createElement("div");
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendSystemMessage(text) {
  const msg = document.createElement("div");
  msg.textContent = text;
  msg.style.color = "#888";
  msg.style.fontStyle = "italic";
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
