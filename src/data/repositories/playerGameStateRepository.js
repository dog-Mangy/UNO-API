import { PlayerGameState } from "../models/playerGameState.js";

export const PlayerGameStateRepository = {
    async findByGameId(gameId) {
        return await PlayerGameState.find({ game: gameId });
    },
    async findByUserAndGame(userId, gameId) {
        return await PlayerGameState.findOne({ user: userId, game: gameId });
    },
    async create(playerGameStateData) {
        const newState = new PlayerGameState(playerGameStateData);
        return await newState.save();
    },
    async updateReadyState(userId, gameId, ready) {
        return await PlayerGameState.findOneAndUpdate(
            { user: userId, game: gameId },
            { ready },
            { new: true, upsert: true } 
        );
    }
};
