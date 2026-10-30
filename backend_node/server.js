// backend_node/server.js
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { conectarDB } from './config/db.js';
import { initListenerFirebase } from './services/firebaseListener.js';

const PORT = process.env.PORT || 3000;

// 1. Conectar a la base de datos de MongoDB Atlas
conectarDB();

// 2. Crear el servidor HTTP envolviendo la app de Express
const server = http.createServer(app);

// 3. Inicializar Socket.io con configuración de CORS
const io = new Server(server, {
    cors: {
        origin: "*", // En producción se restringe al dominio del frontend
        methods: ["GET", "POST"]
    }
});

// Guardamos la referencia de socket.io en Express
app.set('io', io);


// 4. Gestión de conexiones WebSocket
io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado vía WebSocket: ${socket.id}`);

    // Permite a los clientes unirse a salas específicas (ej: 'agentes')
    socket.on('join_room', (sala) => {
        socket.join(sala);
        console.log(`👤 Socket ${socket.id} se unió a la sala: ${sala}`);
    });

    socket.on('disconnect', () => {
        console.log(`❌ Cliente desconectado: ${socket.id}`);
    });
});

// 5. Arrancar la escucha en tiempo real de Firestore
initListenerFirebase(io);

// 6. Levantar el servidor HTTP en el puerto configurado
server.listen(PORT, () => {
    console.log(`🚀 Servidor HTTP y WebSockets corriendo en http://localhost:${PORT}`);
});