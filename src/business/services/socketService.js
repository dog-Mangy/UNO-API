import { joinGameService } from "./gameService.js";

export const socketService = {
    async handleJoinGame(gameId, playerId, socket, io) {
        const result = await joinGameService(gameId, playerId);
        socket.join(gameId);

        io.to(gameId).emit("playerJoined", { playerId, gameId });

        return result.body;
    }
};

