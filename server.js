const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let users = {}; 

io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId, name, vipLevel, isGhost, clan }) => {
    if (!isGhost) { // Punto: MODO FANTASMA
        socket.join(roomId);
        users[socket.id] = { roomId, name, vipLevel, clan };
        socket.to(roomId).emit("user-connected", { id: socket.id, name, vipLevel, clan });
    } else {
        socket.join(roomId); // Entra pero no avisa a nadie
        console.log("Entró un fantasma");
    }
  });

  // Punto: REGALOS + ANIMACIÓN + RANKING
  socket.on("send-gift", (data) => {
    io.to(data.roomId).emit("receive-gift", data);
    // Punto: EVENTOS GLOBALES (Si el regalo es grande, avisa a toda la app)
    if(data.precio >= 1000) {
        io.emit("global-event", { msg: `🔥 ${data.de} del clan ${data.clan} lanzó un regalo masivo!` });
    }
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
        socket.to(users[socket.id].roomId).emit("user-disconnected", socket.id);
        delete users[socket.id];
    }
  });
});

server.listen(process.env.PORT || 4000, () => console.log("Servidor Pro Corriendo"));
