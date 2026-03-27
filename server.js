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

  socket.on("join-room", ({ roomId, name }) => {
    socket.join(roomId);
    users[socket.id] = roomId;

    socket.to(roomId).emit("user-connected", {
      id: socket.id,
      name
    });
  });

  // 🔥 WEBRTC
  socket.on("offer", ({ offer, to }) => {
    socket.to(to).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ answer, to }) => {
    socket.to(to).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ candidate, to }) => {
    socket.to(to).emit("ice-candidate", { candidate, from: socket.id });
  });

  // 🎁 regalos
  socket.on("send-gift", ({ roomId, icon }) => {
    socket.to(roomId).emit("receive-gift", { icon });
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