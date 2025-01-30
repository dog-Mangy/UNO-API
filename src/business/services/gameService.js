import { Game } from "../../data/models/gameModel.js";
import { Player } from "../../data/models/userModel.js";
import { PlayerGameState } from "../../data/models/playerGameState.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { authenticateUser } from "../../utils/authentificate.js";

dotenv.config();

export const createGameService = async ({ title, status, maxPlayers, creator }) => {
    if (!title || !status || !maxPlayers || !creator) {
        return { status: 400, body: { message: "Todos los campos son obligatorios" } };
    }

    const user = await Player.findById(creator);
    if (!user) {
        return { status: 404, body: { message: "Jugador no encontrado" } };
    }

    const newGame = new Game({ title, status, maxPlayers, creator });
    await newGame.save();

    return { status: 201, body: newGame };
};

export const joinGameService = async (gameId, userId) => {
    const game = await Game.findById(gameId);
    if (!game) {
        return { status: 404, body: { message: "Juego no encontrado" } };
    }

    if (game.players.includes(userId)) {
        return { status: 400, body: { message: "Ya estás en este juego" } };
    }

    if (game.players.length >= game.maxPlayers) {
        return { status: 400, body: { message: "El juego ya está lleno" } };
    }

    game.players.push(userId);
    await game.save();

    return { status: 200, body: { message: "Te has unido al juego", game } };
};

export const leaveGameService = async (game_id, userId) => {
    if (!game_id || !userId) {
        return { status: 400, body: { message: "Faltan parámetros obligatorios" } };
    }

    if (!mongoose.Types.ObjectId.isValid(game_id)) {
        return { status: 400, body: { message: `ID de juego inválido: ${game_id}` } };
    }

    const game = await Game.findById(game_id);
    if (!game) {
        return { status: 404, body: { message: "Juego no encontrado" } };
    }

    if (!game.players.includes(userId)) {
        return { status: 400, body: { message: "No estás en este juego" } };
    }

    game.players = game.players.filter(playerId => playerId.toString() !== userId);
    await game.save();

    return { status: 200, body: { message: "Usuario abandonó el juego exitosamente" } };
};

export const startGameService = async (game_id, access_token) => {
    if (!game_id || !access_token) {
        return { status: 400, body: { message: "Faltan parámetros obligatorios" } };
    }

    const game = await Game.findById(game_id);
    if (!game) {
        return { status: 404, body: { message: "Juego no encontrado" } };
    }

    const authResult = authenticateUser(access_token);
    if (authResult.status !== 200) {
        return authResult; 
    }

    const userId = authResult.userId;

    if (game.creator.toString() !== userId) {
        return { status: 403, body: { message: "No tienes permisos para iniciar este juego" } };
    }

    const playersReadyState = await PlayerGameState.find({ game: game_id });
    const allReady = playersReadyState.every(player => player.ready);
    if (!allReady) {
        return { status: 400, body: { message: "No todos los jugadores están listos" } };
    }

    game.status = "started";
    await game.save();

    return { status: 200, body: { message: "Juego iniciado correctamente" } };
};

export const endGameService = async (game_id, access_token) => {
    if (!game_id || !access_token) {
        return { status: 400, body: { message: "Faltan parámetros obligatorios" } };
    }

    const game = await Game.findById(game_id);
    if (!game) {
        return { status: 404, body: { message: "Juego no encontrado" } };
    }

    const authResult = authenticateUser(access_token);
    if (authResult.status !== 200) {
        return authResult; 
    }

    const userId = authResult.userId;

    if (game.creator.toString() !== userId) {
        return { status: 403, body: { message: "No tienes permisos para finalizar este juego" } };
    }

    if (game.status !== "started") {
        return { status: 400, body: { message: "El juego no está en curso" } };
    }

    game.status = "finished";
    await game.save();

    return { status: 200, body: { message: "Juego finalizado correctamente" } };
};

export const getCurrentPlayerService = async (game_id) => {
    if (!game_id) {
        return { status: 400, body: { error: "El game_id es requerido" } };
    }

    const game = await Game.findById(game_id).populate("players", "name");

    if (!game) {
        return { status: 404, body: { error: "Juego no encontrado" } };
    }

    if (game.status !== "started") {
        return { status: 400, body: { error: "El juego no está en curso" } };
    }

    if (game.players.length === 0) {
        return { status: 400, body: { error: "No hay jugadores en este juego" } };
    }

    const currentPlayer = game.players[game.turnIndex];

    if (!currentPlayer) {
        return { status: 400, body: { error: "No hay un jugador válido en este turno" } };
    }

    return { 
        status: 200, 
        body: {
            game_id,
            current_player: currentPlayer.name
        }
    };
};

export const getAllGamesService = async () => {
    const games = await Game.find();
    if (!games.length) {
        return { status: 404, body: { message: "No se encontraron juegos" } };
    }
    return { status: 200, body: games };
};

export const getGameByIdService = async (id) => {
    const game = await Game.findById(id);
    if (!game) {
        return { status: 404, body: { message: "Juego no encontrado" } };
    }
    return { status: 200, body: game };
};

export const getSatusByIdService = async (id) => {
    const game = await Game.findById(id);
    if (!game) {
        return { status: 404, body: { message: "Juego no encontrado" } };
    }

    return { 
        status: 200, 
        body: { 
            game_id: game._id, 
            state: game.status 
        } 
    };
};

export const getUserByIdService = async (id) => {
    const game = await Game.findById(id);
    if (!game) {
        return { status: 404, body: { message: "Juego no encontrado" } };
    }

    return { 
        status: 200, 
        body: { 
            game_id: game._id, 
            players: game.players 
        } 
    };
};

export const updateGameService = async (id, updates) => {
    const updatedGame = await Game.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedGame) {
        return { status: 404, body: { message: "Juego no encontrado" } };
    }
    return { status: 200, body: { message: "Juego actualizado exitosamente", updatedGame } };
};

export const deleteGameService = async (id) => {
    const deletedGame = await Game.findByIdAndDelete(id);
    if (!deletedGame) {
        return { status: 404, body: { message: "Juego no encontrado" } };
    }
    return { status: 200, body: { message: "Juego eliminado exitosamente", deletedGame } };
};
