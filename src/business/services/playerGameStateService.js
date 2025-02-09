
import { Game } from "../../data/models/gameModel.js";
import { PlayerGameState } from "../../data/models/playerGameState.js";
import { Player } from "../../data/models/userModel.js";
import { ValidationError, NotFoundError } from "../../utils/customErrors.js";

export class PlayerGameStateService {
    static async updateReadyState(gameId, userId, ready) {
        if (!gameId || !userId) {
            throw new ValidationError("Faltan parámetros obligatorios");
        }

        const game = await Game.findById(gameId);
        if (!game) {
            throw new NotFoundError("Juego no encontrado");
        }

        const user = await Player.findById(userId);
        if (!user) {
            throw new NotFoundError("Jugador no encontrado");
        }

        let playerState = await PlayerGameState.findOne({ user: userId, game: gameId });

        if (!playerState) {
            playerState = new PlayerGameState({ user: userId, game: gameId, ready });
        } else {
            playerState.ready = ready;
        }

        await playerState.save();

        return { message: "Estado actualizado correctamente", playerState };
    }
}
