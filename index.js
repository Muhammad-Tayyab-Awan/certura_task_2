const dotenv = require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const socketIO = require("socket.io");

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

app.all(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "views/not-found.html"));
});

let onlineUsers = [];

io.use((socket, next) => {
  const username = socket.handshake.headers.cookie
    .split(";")
    .find((cookie) => cookie.trim().startsWith("sca_username="))
    .split("=")[1];
  socket.username = username;
  next();
});

io.on("connect", (socket) => {
  onlineUsers.push(socket.username);
  socket.emit("online_users", { onlineUsers: onlineUsers.length });
  socket.broadcast.emit("online_users", { onlineUsers: onlineUsers.length });
  socket.broadcast.emit("new_user_joined", { joinedUsername: socket.username });
  socket.on("message", ({ message }) => {
    socket.broadcast.emit("message", {
      message,
      fromUsername: socket.username
    });
  });
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((value) => {
      return value !== socket.username;
    });
    socket.broadcast.emit("online_users", { onlineUsers: onlineUsers.length });
  });
});

server.listen(port, () => {
  console.clear();
  console.log(`Server running on http://localhost:${port}`);
});
