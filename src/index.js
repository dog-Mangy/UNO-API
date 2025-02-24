import app from "./app.js";
import { connectDB } from "./config/database.js";
import http from "http";
import dotenv from "dotenv";
import { configureSockets } from "./socket/configureSockets.js";


dotenv.config();


connectDB(); 

const PORT = process.env.PORT;

const server = http.createServer(app);
const io = configureSockets(server);
const socket = io;

server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});

io.on("connection", (socket) => {
    console.log(`🎉 Nueva conexión detectada: ${socket.id}`);
});
