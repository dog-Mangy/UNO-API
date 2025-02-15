import { CardRepository } from "../../../data/repositories/cardRepository.js";
import { NotFoundError } from "../../../utils/customErrors.js";

export class CardRetrievalService {
    static async getAllCards() {
        const cards = await CardRepository.findAll();
        if (!cards || cards.length === 0) {
            throw new NotFoundError("No cards found");
        }
        return cards;
    }

    static async getCardById(id) {
        const card = await CardRepository.findById(id);
        if (!card) {
            throw new NotFoundError("Card not found");
        }
        return card;
    }
}