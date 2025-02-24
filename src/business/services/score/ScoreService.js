import { GameRepository } from "../../../data/repositories/gameRepository.js";
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

    static async calculateFinalScores(gameId, winnerId) {
        const game = await GameRepository.getGameWithPlayers(gameId);
    
        if (!game) {
            throw new ValidationError("Juego no encontrado.");
        }
    
        if (!winnerId) {
            throw new ValidationError("El ganador no es válido.");
        }
    
        // Verificar si el juego tiene jugadores
        if (!game.players || game.players.length === 0) {
            throw new ValidationError("No hay jugadores en la partida.");
        }
    
        const sortedPlayers = game.players
            .filter(player => player._id && player._id.toString() !== winnerId.toString())
            .map(player => player._id.toString());
    
        const scores = {
            [winnerId]: 10,
            [sortedPlayers[0] || "default"]: 5,
            [sortedPlayers[1] || "default"]: 3
        };
    
        const validScores = Object.entries(scores)
            .filter(([playerId]) => playerId !== "default");
    
        await Promise.all(
            validScores.map(([playerId, score]) =>
                ScoreRepository.create({ playerId, gameId, score })
            )
        );
    
        return Object.fromEntries(validScores);
    }

    static async getGameScores(gameId) {
        if (!gameId) {
            throw new Error("gameId es requerido.");
        }

        const scoresData = await ScoreRepository.getScores(gameId);

        const scores = scoresData.reduce((acc, score) => {
            const playerName = score.playerId.username || score.playerId._id.toString();
            acc[playerName] = score.score;
            return acc;
        }, {});

        return { scores };
    }
}
