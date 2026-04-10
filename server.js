const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path"); // Necesario para las rutas de archivos
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- ✅ SOLUCIÓN AL ERROR "CANNOT GET" ---
// Esto le dice a Render que busque tus archivos (room.html, css, js) en la carpeta raíz o en 'public'
app.use(express.static(__dirname)); 

// Ruta para cargar tu archivo principal por defecto
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'room.html')); // Asegúrate de que tu archivo se llame room.html
});

let users = {}; 

io.on("connection", (socket) => {
  // Punto: MODO FANTASMA
  socket.on("join-room", ({ roomId, name, vipLevel, isGhost, clan }) => {
    if (!isGhost) { 
        socket.join(roomId);
        users[socket.id] = { roomId, name, vipLevel, clan };
        // Notificación de entrada (Entradas animadas según el nivel)
        socket.to(roomId).emit("user-connected", { id: socket.id, name, vipLevel, clan });
    } else {
        socket.join(roomId); // Entra invisible
        console.log("Entró un fantasma");
    }
  });

  // Punto: REGALOS + ANIMACIÓN + RANKING
  socket.on("send-gift", (data) => {
    io.to(data.roomId).emit("receive-gift", data);
    
    // Punto: EVENTOS GLOBALES (Regalos masivos)
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

// Cambiado a puerto 3000 para mejor compatibilidad con Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Servidor Pro GOD MODE Corriendo en puerto " + PORT));
