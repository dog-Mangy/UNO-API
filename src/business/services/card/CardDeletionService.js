import { CardRepository } from "../../../data/repositories/cardRepository.js";
import { NotFoundError } from "../../../utils/customErrors.js";

export class CardDeletionService {
    static async deleteCard(id) {
        const deletedCard = await CardRepository.deleteById(id);
        if (!deletedCard) {
            throw new NotFoundError("Card not found");
        }
        return { message: "Card deleted successfully", deletedCard };
    }
}