const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Esto permite que Render encuentre index.html y room.html en la raíz
app.use(express.static(__dirname));

// Ruta para la página de inicio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para la sala (GOD MODE FULL)
app.get('/room.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'room.html'));
});

io.on("connection", (socket) => {
    // Aquí vive la lógica de tu lista "TODO INCLUIDO"
    socket.on("join-room", (data) => {
        socket.join(data.roomId);
        // Maneja el Modo Fantasma y Entradas Animadas aquí
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Servidor Online"));
