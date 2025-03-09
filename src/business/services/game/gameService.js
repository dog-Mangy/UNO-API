import mongoose from "mongoose";
import dotenv from "dotenv";
import { authenticateUser } from "../../../utils/authentificate.js";
import { GameRepository } from "../../../data/repositories/gameRepository.js";
import { NotFoundError, ValidationError, ConflictError, UnauthorizedError } from "../../../utils/customErrors.js";
import { PlayerGameStateService } from "../playerGameStateService.js";


dotenv.config();

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

    await PlayerGameStateService.updateReadyState(gameId, userId, false);

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


export const getNextPlayerService = async (gameId, shouldSkip = false) => {
    const game = await GameRepository.getGameWithPlayers(gameId);

    if (!game) {
        throw new Error("Juego no encontrado.");
    }

    if (!game.players || game.players.length === 0) {
        throw new Error("No hay jugadores en la partida.");
    }

    const players = game.players;
    let turnIndex = game.turnIndex ?? 0;

    turnIndex = (turnIndex + 1) % players.length;

    if (shouldSkip) {
        turnIndex = (turnIndex + 1) % players.length;
    }

    const nextPlayer = players[turnIndex];

    const updatedGame = await GameRepository.updateById(gameId, { turnIndex });

    if (!updatedGame) {
        throw new Error("No se pudo actualizar el turno en la base de datos.");
    }

    console.log(`🔄 Turno cambiado: Jugador actual -> ${nextPlayer._id} (Skip: ${shouldSkip})`);
    console.log("📌 Estado actualizado del juego:", updatedGame);

    return { nextPlayerId: nextPlayer._id, message: shouldSkip ? "Turno saltado por carta Skip" : "Turno actualizado correctamente" };
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
        body: { 
            game_id, 
            current_player: { 
                name: currentPlayer.name, 
                id: currentPlayer.id 
            }
        }
    };    
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