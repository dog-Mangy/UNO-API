import { GameHistoryRepository } from "../../data/repositories/gameHistoryRepository.js";

export class GameHistoryService {
    static async getHistory(gameId) {
        if (!gameId) {
            throw new Error("gameId es requerido.");
        }

        return await GameHistoryRepository.getHistory(gameId);
    }
}
