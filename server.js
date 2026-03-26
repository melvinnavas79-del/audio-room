const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

let rooms = {};

io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  socket.on("create-room", () => {
    const roomId = uuidv4();
    rooms[roomId] = [];
    socket.join(roomId);
    rooms[roomId].push(socket.id);
    socket.emit("room-created", roomId);
  });

  socket.on("join-room", (roomId) => {
    if (rooms[roomId]) {
      socket.join(roomId);
      rooms[roomId].push(socket.id);
      io.to(roomId).emit("user-joined", socket.id);
    }
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});
