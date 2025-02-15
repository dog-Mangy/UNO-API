import { Card } from "../models/cardModel.js";

export class CardRepository {
    static async create(cardData) {
        const newCard = new Card(cardData);
        return await newCard.save();
    }

    static async findAll() {
        return await Card.find();
    }

    static async findById(id) {
        return await Card.findById(id);
    }

    static async findTopDiscardCard(gameId) {
        return await Card.findOne({ gameId }).sort({ createdAt: -1 });
    }

    static async updateById(id, updates) {
        return await Card.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    }

    static async deleteById(id) {
        return await Card.findByIdAndDelete(id);
    }
}
