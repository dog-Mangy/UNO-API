import mongoose from "mongoose";
import dotenv from "dotenv";
import { authenticateUser } from "../../utils/authentificate.js";
import { GameRepository } from "../../data/repositories/gameRepository.js";
import { UserRepository } from "../../data/repositories/userRepository.js";
import { PlayerGameStateRepository } from "../../data/repositories/playerGameStateRepository.js";
import { NotFoundError, ValidationError, ConflictError, UnauthorizedError } from "../../utils/customErrors.js";

dotenv.config();

export const createGameService = async ({ title, status, maxPlayers, creator }) => {
    if (!title || !status || !maxPlayers || !creator) {
        throw new ValidationError("All fields are required");
    }

    const user = await UserRepository.findById(creator);
    if (!user) {
        throw new NotFoundError("Player not found");
    }

    const newGame = await GameRepository.create({ title, status, maxPlayers, creator });
    return { status: 201, body: newGame };
};

export const joinGameService = async (gameId, userId) => {
    const game = await GameRepository.findById(gameId);
    if (!game) {
        throw new NotFoundError("Game not found");
    }

    if (game.players.includes(userId)) {
        throw new ConflictError("You are already in this game");
    }

    if (game.players.length >= game.maxPlayers) {
        throw new ValidationError("The game is already full");
    }

    const updatedGame = await GameRepository.addPlayer(gameId, userId);
    return { status: 200, body: { message: "You have joined the game", updatedGame } };
};

export const leaveGameService = async (game_id, userId) => {
    if (!game_id || !userId) {
        throw new ValidationError("Missing required parameters");
    }

    if (!mongoose.Types.ObjectId.isValid(game_id)) {
        throw new ValidationError(`Invalid game ID: ${game_id}`);
    }

    const game = await GameRepository.findById(game_id);
    if (!game) {
        throw new NotFoundError("Game not found");
    }

    if (!game.players.includes(userId)) {
        throw new ConflictError("You are not in this game");
    }

    const updatedGame = await GameRepository.removePlayer(game_id, userId);
    return { status: 200, body: { message: "User successfully left the game", game: updatedGame } };
};

export const startGameService = async (game_id, access_token) => {
    if (!game_id || !access_token) {
        throw new ValidationError("Missing required parameters");
    }

    const game = await GameRepository.findById(game_id);
    if (!game) {
        throw new NotFoundError("Game not found");
    }

    const authResult = authenticateUser(access_token);
    if (authResult.status !== 200) {
        throw new UnauthorizedError("Invalid or expired token");
    }

    const userId = authResult.userId;
    if (game.creator.toString() !== userId) {
        throw new UnauthorizedError("You do not have permission to start this game");
    }

    const playersReadyState = await PlayerGameStateRepository.findByGameId(game_id);
    const allReady = playersReadyState.every(player => player.ready);
    if (!allReady) {
        throw new ValidationError("Not all players are ready");
    }

    const updatedGame = await GameRepository.updateStatus(game_id, "started");

    return { status: 200, body: { message: "Game started successfully" }, updatedGame };
};

export const endGameService = async (game_id, access_token) => {
    if (!game_id || !access_token) {
        throw new ValidationError("Missing required parameters");
    }

    const game = await GameRepository.findById(game_id);
    if (!game) {
        throw new NotFoundError("Game not found");
    }

    const authResult = authenticateUser(access_token);
    if (authResult.status !== 200) {
        throw new UnauthorizedError("Invalid or expired token");
    }

    const userId = authResult.userId;
    if (game.creator.toString() !== userId) {
        throw new UnauthorizedError("You do not have permission to end this game");
    }

    if (game.status !== "started") {
        throw new ValidationError("The game is not in progress");
    }

    const updatedGame = await GameRepository.updateStatus(game_id, "finished");

    return { status: 200, body: { message: "Game ended successfully", game: updatedGame } };
};


export const getCurrentPlayerService = async (game_id) => {
    if (!game_id) {
        throw new ValidationError("game_id is required");
    }

    const game = await GameRepository.findByIdWithPlayers(game_id);
    if (!game) {
        throw new NotFoundError("Game not found");
    }

    if (game.status !== "started") {
        throw new ValidationError("The game is not in progress");
    }

    if (game.players.length === 0) {
        throw new ValidationError("There are no players in this game");
    }

    const currentPlayer = game.players[game.turnIndex];

    if (!currentPlayer) {
        throw new ValidationError("No valid player in this turn");
    }

    return { 
        status: 200, 
        body: { game_id, current_player: currentPlayer.name }
    };
};

export const getAllGamesService = async () => {
    const games = await GameRepository.findAll();
    if (!games.length) {
        throw new NotFoundError("No games found");
    }
    return { status: 200, body: games };
};

export const getGameByIdService = async (id) => {
    const game = await GameRepository.findById(id);
    if (!game) {
        throw new NotFoundError("Game not found");
    }
    return { status: 200, body: game };
};

export const getSatusByIdService = async (id) => {
    const game = await GameRepository.findById(id);
    if (!game) {
        throw new NotFoundError("Game not found");
    }

    return { 
        status: 200, 
        body: { game_id: game._id, state: game.status } 
    };
};

export const getUserByIdService = async (id) => {
    const game = await GameRepository.findById(id);
    if (!game) {
        throw new NotFoundError("Game not found");
    }

    return { 
        status: 200, 
        body: { game_id: game._id, players: game.players } 
    };
};

export const updateGameService = async (id, updates) => {
    const updatedGame = await GameRepository.updateById(id, updates, { new: true });
    if (!updatedGame) {
        throw new NotFoundError("Game not found");
    }
    return { status: 200, body: { message: "Game updated successfully", updatedGame } };
};

export const deleteGameService = async (id) => {
    const deletedGame = await GameRepository.deleteById(id);
    if (!deletedGame) {
        throw new NotFoundError("Game not found");
    }
    return { status: 200, body: { message: "Game deleted successfully", deletedGame } };
};
