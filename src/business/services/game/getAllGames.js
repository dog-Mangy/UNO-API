import { GameRepository } from "../../../data/repositories/gameRepository.js";
import { NotFoundError } from "../../../utils/customErrors.js";

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

export const getGameCreatorService = async (gameId) => {
    const creator = await GameRepository.getCreator(gameId);
    if (!creator) {
        throw new NotFoundError("Game not found or creator not set");
    }
    return { status: 200, body: creator };
};
