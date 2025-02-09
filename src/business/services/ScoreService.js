import { Game } from "../../data/models/gameModel.js";
import { Score } from "../../data/models/scoreModel.js";
import { NotFoundError, ValidationError } from "../../utils/customErrors.js";

export class ScoreService {
    static async createScore(playerId, gameId, score) {
        if (!playerId || !gameId || !score) {
            throw new ValidationError("Todos los campos son obligatorios");
        }

        const newScore = new Score({ playerId, gameId, score });
        await newScore.save();
        return newScore;
    }

    static async getAllScores() {
        const scores = await Score.find();
        if (!scores || scores.length === 0) {
            throw new NotFoundError("No se encontraron puntuaciones");
        }
        return scores;
    }

    static async getScoreById(id) {
        const score = await Score.findById(id);
        if (!score) {
            throw new NotFoundError("Puntuación no encontrada");
        }
        return score;
    }

    static async getScoresByGame(gameId) {
        if (!gameId) {
            throw new ValidationError("El game_id es requerido");
        }

        const game = await Game.findById(gameId);
        if (!game) {
            throw new NotFoundError("Juego no encontrado");
        }

        const scores = await Score.find({ gameId }).populate("playerId", "name");

        if (scores.length === 0) {
            throw new ValidationError("No hay puntuaciones registradas");
        }
        

        const scoresFormatted = {};
        scores.forEach(score => {
            scoresFormatted[score.playerId.name] = score.score;
        });

        return { gameId, scores: scoresFormatted };
    }

    static async updateScore(id, updates) {
        const updatedScore = await Score.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedScore) {
            throw new NotFoundError("Puntuación no encontrada");
        }
        return updatedScore;
    }

    static async deleteScore(id) {
        const deletedScore = await Score.findByIdAndDelete(id);
        if (!deletedScore) {
            throw new NotFoundError("Puntuación no encontrada");
        }
        return deletedScore;
    }
}
