import { GameHistory } from "../models/gameHistoryModel.js";

export class GameHistoryRepository {
    static async logAction(gameId, playerId, action) {
        return await GameHistory.create({ gameId, playerId, action });
    }

    static async getHistory(gameId) {
        return await GameHistory.find({ gameId }).sort({ timestamp: 1 });
    }
}
