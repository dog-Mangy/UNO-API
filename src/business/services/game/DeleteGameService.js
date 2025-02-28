import { GameRepository } from "../../../data/repositories/gameRepository.js";
import { NotFoundError } from "../../../utils/customErrors.js";

export const deleteGameService = async (id) => {
    const deletedGame = await GameRepository.deleteById(id);
    if (!deletedGame) {
        throw new NotFoundError("Game not found");
    }
    return { status: 200, body: { message: "Game deleted successfully", deletedGame } };
};
