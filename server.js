const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

let users = {};

io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    users[socket.id] = roomId;

    socket.to(roomId).emit("user-connected", socket.id);
  });

  socket.on("offer", ({ offer, userId }) => {
    socket.to(userId).emit("offer", {
      offer,
      userId: socket.id
    });
  });

  socket.on("answer", ({ answer, userId }) => {
    socket.to(userId).emit("answer", {
      answer,
      userId: socket.id
    });
  });

  socket.on("ice-candidate", ({ candidate, userId }) => {
    socket.to(userId).emit("ice-candidate", {
      candidate
    });
  });

  socket.on("disconnect", () => {
    const roomId = users[socket.id];
    if (roomId) {
      socket.to(roomId).emit("user-disconnected", socket.id);
    }
    delete users[socket.id];
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});