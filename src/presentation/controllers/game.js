import { createGameService } from "../../business/services/game/CreationGameService.js";
import { deleteGameService } from "../../business/services/game/DeleteGameService.js";
import { getAllGamesService, getGameByIdService } from "../../business/services/game/getAllGames.js";
import { updateGameService } from "../../business/services/game/updateGameService.js";
import { joinGameService, leaveGameService, endGameService, getSatusByIdService, getUserByIdService, getCurrentPlayerService  } from "../../business/services/game/gameService.js";
import { startGameService } from "../../business/services/game/StartGameService.js";

export const post = async (req, res, next) => {
    try {
        const { title, status, maxPlayers } = req.body;
        const userId = req.user.id; 

        const newGame = await createGameService({ title, status, maxPlayers, creator: userId });

        res.status(201).json(newGame);
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
