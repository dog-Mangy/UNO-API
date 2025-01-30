import { Game } from "../../data/models/gameModel.js";
import { PlayerGameState } from "../../data/models/playerGameState.js";
import { Player } from "../../data/models/userModel.js";
import { ValidationError, NotFoundError } from "../../utils/customErrors.js";


export const updateReadyState = async (req, res, next) => {
    try {
        const { gameId } = req.params; // ID del juego desde la URL
        const { userId, ready } = req.body; // ID del usuario y nuevo estado

        if (!gameId || !userId) {
            return next(new ValidationError("Faltan parámetros obligatorios"));
        }

        const game = await Game.findById(gameId);
        if (!game) {
            return next(new NotFoundError("Juego no encontrado"));
        }

        const user = await Player.findById(userId);
        if (!user) {
            return next(new NotFoundError("Jugador no encontrado"));
        }

        let playerState = await PlayerGameState.findOne({ user: userId, game: gameId });

        if (!playerState) {
            playerState = new PlayerGameState({ user: userId, game: gameId, ready });
        } else {
            playerState.ready = ready;
        }

        await playerState.save();

        res.status(200).json({ message: "Estado actualizado correctamente", playerState });
    } catch (error) {
        next(error);
    }
};
