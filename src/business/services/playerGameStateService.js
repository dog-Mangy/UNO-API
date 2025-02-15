import { PlayerGameStateRepository } from "../../data/repositories/playerGameStateRepository.js";
import { GameRepository } from "../../data/repositories/gameRepository.js";
import { UserRepository } from "../../data/repositories/userRepository.js";
import { ValidationError, NotFoundError } from "../../utils/customErrors.js";

export class PlayerGameStateService {
    static async updateReadyState(gameId, userId, ready) {
        if (!gameId || !userId) {
            throw new ValidationError("Faltan parámetros obligatorios");
        }

        const game = await GameRepository.findById(gameId);
        if (!game) {
            throw new NotFoundError("Juego no encontrado");
        }

        const user = await UserRepository.findById(userId);
        if (!user) {
            throw new NotFoundError("Jugador no encontrado");
        }

        const updatedState = await PlayerGameStateRepository.updateReadyState(userId, gameId, ready);

        return { message: "Estado actualizado correctamente", playerState: updatedState };
    }
}
