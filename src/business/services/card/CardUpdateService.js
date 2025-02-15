import { CardRepository } from "../../../data/repositories/cardRepository.js";
import { NotFoundError, ValidationError } from "../../../utils/customErrors.js";

export class CardUpdateService {
    static async updateCard(id, updates) {
        try {
            const updatedCard = await CardRepository.updateById(id, updates);
            if (!updatedCard) {
                throw new NotFoundError("Card not found");
            }
            return { message: "Card updated successfully", updatedCard };
        } catch (error) {
            if (error.name === "ValidationError") {
                throw new ValidationError("Card data error");
            }
            throw error;
        }
    }
}