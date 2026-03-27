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

  // 👥 ENTRAR A SALA
  socket.on("join-room", ({ roomId, name }) => {
    socket.join(roomId);
    users[socket.id] = roomId;

    socket.to(roomId).emit("user-connected", {
      id: socket.id,
      name
    });
  });

  // 🎁 REGALOS
  socket.on("send-gift", ({ roomId, icon }) => {
    socket.to(roomId).emit("receive-gift", {
      icon
    });
  });

  // 🔌 DESCONEXIÓN
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