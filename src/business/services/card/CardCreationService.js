import { CardRepository } from "../../../data/repositories/cardRepository.js";
import { ValidationError } from "../../../utils/customErrors.js";


export class CardCreationService {
    static async createCard({ color, value, playerId = null, gameId }) {
        if (!color || !value || !gameId) {
            throw new ValidationError("Color, value and gameId are required");
        }
        return await CardRepository.create({ color, value, playerId, gameId });
    }
}