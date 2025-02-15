import { CardRepository } from "../../../data/repositories/cardRepository.js";
import { NotFoundError, ValidationError } from "../../../utils/customErrors.js";

export class CardGameService {
    static async getTopDiscardCard(gameId) {
        if (!gameId) {
            throw new ValidationError("game_id is required");
        }

        const topCard = await CardRepository.findTopDiscardCard(gameId);
        if (!topCard) {
            throw new NotFoundError("No cards in the discard pile");
        }

        return {
            game_id: gameId,
            top_card: `${topCard.value} of ${topCard.color}`
        };
    }
}