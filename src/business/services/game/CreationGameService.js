import { GameRepository } from "../../../data/repositories/gameRepository.js";
import { UserRepository } from "../../../data/repositories/userRepository.js";
import { NotFoundError, ValidationError } from "../../../utils/customErrors.js";

export const createGameService = async ({ title, status, maxPlayers, creator }) => {
    if (!title || !maxPlayers) {
        throw new ValidationError("Todos los campos son obligatorios");
    }

    const user = await UserRepository.findById(creator);
    if (!user) {
        throw new NotFoundError("Jugador no encontrado");
    }

    return await GameRepository.create({ title, status, maxPlayers, creator });
};