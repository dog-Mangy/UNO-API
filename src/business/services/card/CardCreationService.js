import { CardRepository } from "../../../data/repositories/cardRepository";
import { ValidationError } from "../../../utils/customErrors";


export class CardCreationService {
    static async createCard({ color, value, playerId, gameId }) {
        if (!color || !value || !playerId || !gameId) {
            throw new ValidationError("All fields are required");
        }
        return await CardRepository.create({ color, value, playerId, gameId });
    }
}