import { GameRepository } from "../../../data/repositories/gameRepository.js";
import { NotFoundError } from "../../../utils/customErrors.js";

export const updateGameService = async (id, updates) => {
    const updatedGame = await GameRepository.updateByIdGame(id, updates, { new: true });
    if (!updatedGame) {
        throw new NotFoundError("Game not found");
    }
    return { status: 200, body: { message: "Game updated successfully", updatedGame } };
};