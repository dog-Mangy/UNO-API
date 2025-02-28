import { GameRepository } from "../../../data/repositories/gameRepository.js";
import { UserRepository } from "../../../data/repositories/userRepository.js";
import { NotFoundError, ValidationError } from "../../../utils/customErrors.js";

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