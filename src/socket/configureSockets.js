import { Server } from "socket.io";
import { socketService } from "../business/services/socketService.js";

export const configureSockets = (server) => {
    const io = new Server(server, {
        cors: { origin: "*" }
    });

    io.on("connection", (socket) => {
        console.log(`Jugador conectado: ${socket.id}`);

        socket.on("join", async ({ gameId, playerId }) => {
            try {
                const result = await socketService.handleJoinGame(gameId, playerId, socket, io);
                socket.emit("joinSuccess", result);
            } catch (error) {
                socket.emit("joinError", { message: error.message });
            }
        });

        socket.on("disconnect", () => {
            console.log(`Jugador desconectado: ${socket.id}`);
        });
    });

    return io;
};