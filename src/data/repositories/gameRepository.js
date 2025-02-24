import { Game } from "../models/gameModel.js";

export const GameRepository = {
    async create(gameData) {
        const game = new Game(gameData);
        return await game.save();
    },

    async findById(id) {
        return await Game.findById(id);
    },

    async findAll() {
        return await Game.find();
    },

    async updateById(id, updates) {
        return await Game.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    },
    
    async updateStatus(gameId, status) {
        return await Game.findByIdAndUpdate(gameId, { status }, { new: true });
    },

    async deleteById(id) {
        return await Game.findByIdAndDelete(id);
    },

    async addPlayer(gameId, userId) {
        return await Game.findByIdAndUpdate(gameId, { $push: { players: userId } }, { new: true });
    },

    async removePlayer(gameId, userId) {
        return await Game.findByIdAndUpdate(gameId, { $pull: { players: userId } }, { new: true });
    },

    async findByIdWithPlayers(gameId) {
        return await Game.findById(gameId).populate("players", "name");
    },

    async getGameWithPlayers(gameId) {
        return await Game.findById(gameId).populate("players");
    },    
    
    async updateTurnIndex(gameId, turnIndex) {
        return await Game.findByIdAndUpdate(gameId, { turnIndex }, { new: true });
    },
    
    async updateUnoStatus(gameId, playerId, hasSaidUno) {
        return await Game.findByIdAndUpdate(
            gameId,
            { $set: { [`unoStatus.${playerId}`]: hasSaidUno } },
            { new: true }
        );
    },
    
    async updateByIdGame(id, updates) {
        return await Game.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    }
    
};