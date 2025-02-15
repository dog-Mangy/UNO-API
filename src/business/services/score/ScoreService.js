import { ScoreRepository } from "../../../data/repositories/scoreRepository.js";
import { NotFoundError, ValidationError } from "../../../utils/customErrors.js";
import { ScoreValidator } from "../../validators/scoreValidator.js";

export class ScoreService {
    constructor(scoreStrategy = new StandardScoreStrategy()) {
        this.scoreStrategy = scoreStrategy;
    }

    async createScore(playerId, gameId, score) {
        ScoreValidator.validateScoreData(playerId, gameId, score);

        const finalScore = this.scoreStrategy.calculateScore(score);
        return await ScoreRepository.create({ playerId, gameId, score: finalScore });
    }

    setScoreStrategy(strategy) {
        this.scoreStrategy = strategy; 
    }

    static async getAllScores() {
        const scores = await ScoreRepository.findAll();
        if (!scores || scores.length === 0) {
            throw new NotFoundError("No scores found");
        }
        return scores;
    }

    static async getScoreById(id) {
        const score = await ScoreRepository.findById(id);
        if (!score) {
            throw new NotFoundError("Score not found");
        }
        return score;
    }

    static async getScoresByGame(gameId) {
        if (!gameId) {
            throw new ValidationError("Game ID is required");
        }

        const game = await ScoreRepository.findGameById(gameId);
        if (!game) {
            throw new NotFoundError("Game not found");
        }

        const scores = await ScoreRepository.findByGameId(gameId);
        if (scores.length === 0) {
            throw new ValidationError("No scores registered");
        }

        const scoresFormatted = {};
        scores.forEach(score => {
            scoresFormatted[score.playerId.name] = score.score;
        });

        return { gameId, scores: scoresFormatted };
    }

    static async updateScore(id, updates) {
        const updatedScore = await ScoreRepository.updateById(id, updates);
        if (!updatedScore) {
            throw new NotFoundError("Score not found");
        }
        return updatedScore;
    }

    static async deleteScore(id) {
        const deletedScore = await ScoreRepository.deleteById(id);
        if (!deletedScore) {
            throw new NotFoundError("Score not found");
        }
        return deletedScore;
    }
}
