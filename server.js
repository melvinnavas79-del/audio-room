const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } // Esto evita bloqueos de seguridad
});

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/room.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'room.html'));
});

// --- LÓGICA DE COMUNICACIÓN EN VIVO ---
io.on("connection", (socket) => {
    
    socket.on("join-room", (data) => {
        socket.join(data.roomId);
        console.log(`${data.name} entró a la sala: ${data.roomId}`);
        
        // Notificar a todos que alguien entró (Efectos de entrada)
        socket.to(data.roomId).emit("notificacion-sala", {
            msg: `📢 ${data.name} ha llegado con nivel ${data.vipLevel || 0}`,
            color: "#00ffff"
        });
    });

    // Escuchar cuando alguien manda un regalo (León, Dragón, etc.)
    socket.on("enviar-regalo", (data) => {
        io.to(data.roomId).emit("mostrar-regalo", data);
    });

    socket.on("disconnect", () => {
        console.log("Usuario desconectado");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Lluvia Live Promax corriendo en puerto ${PORT}`));
