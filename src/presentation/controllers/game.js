import { startGameService, joinGameService, createGameService, leaveGameService, endGameService, getSatusByIdService, getUserByIdService, getCurrentPlayerService,  } from "../../business/services/gameService.js";
import { getAllGamesService, getGameByIdService, updateGameService, deleteGameService } from "../../business/services/gameService.js";

export const post = async (req, res, next) => {
    try {
        const response = await createGameService(req.body);
        res.status(response.status).json(response.body);
    } catch (error) {
        next(error);
    }
};

export const joinGame = async (req, res, next) => {
    try {
        const response = await joinGameService(req.params.gameId, req.user.id);
        res.status(response.status).json(response.body);
    } catch (error) {
        next(error);
    }
};

export const leaveGame = async (req, res, next) => {
    try {
        const response = await leaveGameService(req.params.gameId, req.user.id);
        res.status(response.status).json(response.body);
    } catch (error) {
        next(error);
    }
};


export const startGame = async (req, res, next) => {
    try {
        const response = await startGameService(req.body.game_id, req.headers.authorization?.split(" ")[1]);
        res.status(response.status).json(response.body);
    } catch (error) {
        next(error);
    }
};


export const endGame = async (req, res, next) => {
    try {
        const response = await endGameService(req.body.game_id, req.headers.authorization?.split(" ")[1]);
        res.status(response.status).json(response.body);
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req, res, next) => {
    try {
        const response = await getAllGamesService();
        res.status(response.status).json(response.body);
    } catch (error) {
        next(error);
    }
};

export const get = async (req, res, next) => {
    try {
        const response = await getGameByIdService(req.params.id);
        res.status(response.status).json(response.body);
    } catch (error) {
        next(error);
    }
};

export const getStatus = async (req, res, next) => {
    try {
        const response = await getSatusByIdService(req.params.id);
        res.status(response.status).json(response.body);
    } catch (error) {
        next(error);
    }
};

export const getPlayers = async (req, res, next) => {
    try {
        const response = await getUserByIdService(req.params.id);
        res.status(response.status).json(response.body);
    } catch (error) {
        next(error);
    }
};

export const getCurrentPlayer = async (req, res, next) => {
    try {
        const response = await getCurrentPlayerService(req.body.game_id);
        res.status(response.status).json(response.body);
    } catch (error) {
        next(error);
    }
};


export const update = async (req, res, next) => {
    try {
        const response = await updateGameService(req.params.id, req.body);
        res.status(response.status).json(response.body);
    } catch (error) {
        next(error);
    }
};

export const deleted = async (req, res, next) => {
    try {
        const response = await deleteGameService(req.params.id);
        res.status(response.status).json(response.body);
    } catch (error) {
        next(error);
    }
};
