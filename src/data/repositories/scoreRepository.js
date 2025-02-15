import { Score } from "../models/scoreModel.js";
import { Game } from "../models/gameModel.js";

export class ScoreRepository {
    static async create(scoreData) {
        const newScore = new Score(scoreData);
        return await newScore.save();
    }

    static async findAll() {
        return await Score.find();
    }

    static async findById(id) {
        return await Score.findById(id);
    }

    static async findByGameId(gameId) {
        return await Score.find({ gameId }).populate("playerId", "name");
    }

    static async updateById(id, updates) {
        return await Score.findByIdAndUpdate(id, updates, { new: true });
    }

    static async deleteById(id) {
        return await Score.findByIdAndDelete(id);
    }

    static async findGameById(gameId) {
        return await Game.findById(gameId);
    }
}
