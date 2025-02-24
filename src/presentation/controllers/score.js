import { BonusScoreStrategy } from "../../business/services/score/BonusScoreStrategy.js";
import { ScoreService } from "../../business/services/score/ScoreService.js";

const scoreService = new ScoreService(new BonusScoreStrategy());


export const post = async (req, res, next) => {
    try {
        const { playerId, gameId, baseScore  } = req.body;
        const newScore = await scoreService.createScore(playerId, gameId, { baseScore });
        res.status(201).json(newScore); 
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req, res, next) => {
    try {
        const scores = await ScoreService.getAllScores();
        res.status(200).json(scores);
    } catch (error) {
        next(error);
    }
};

export const get = async (req, res, next) => {
    try {
        const { id } = req.params;
        const score = await ScoreService.getScoreById(id);
        res.status(200).json(score);
    } catch (error) {
        next(error);
    }
};

export const getScores = async (req, res, next) => {
    try {
        const { game_id } = req.params;
        const scores = await ScoreService.getScoresByGame(game_id);
        res.status(200).json(scores);
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedScore = await ScoreService.updateScore(id, updates);
        res.status(200).json({ message: "Score updated successfully", updatedScore });
    } catch (error) {
        next(error);
    }
};

export const deleted = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedScore = await ScoreService.deleteScore(id);
        res.status(200).json({ message: "Score eliminated successfully", deletedScore });
    } catch (error) {
        next(error);
    }
};


export const getGameScores = async (req, res, next) => {
    try {
        const { gameId } = req.params;

        const result = await ScoreService.getGameScores(gameId);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
