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

app.all(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "views/not-found.html"));
});

server.listen(port, () => {
  console.clear();
  console.log(`Server running on http://localhost:${port}`);
});
