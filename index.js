const bodyParser = require("body-parser");
const express = require("express");
const http = require("http");
const path = require("path");
const socketIO = require("socket.io");

const app = express();
const port = 8000;
const server = http.createServer(app);
const io = socketIO(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.all(/.*/, (req, res) => {
  res.render("not-found");
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
