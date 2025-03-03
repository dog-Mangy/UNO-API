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

    static async updateById(id, updates) {
        return await Card.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    }

    static async deleteById(id) {
        return await Card.findByIdAndDelete(id);
    }

    static async findAllInDeck(gameId) {
        return await Card.find({
            gameId: gameId,      
            playerId: null,       
            discarded: false      
        });
    }

    static async findTopDiscardCard(gameId) {
        return await Card.findOne({
            gameId: gameId,
            playerId: null,
            discarded: true
        }).sort({ updatedAt: -1 });
    }

    static async drawFromDeck(gameId) {
        return await Card.findOneAndUpdate(
            {
                gameId: gameId,
                playerId: null, 
                discarded: false 
            },
            { $set: { playerId: null } },
            { sort: { createdAt: 1 }, new: true }
        );
    }

    static async getPlayerCards(playerId) {
        return await Card.find({ playerId });
    }    

    static async insertMany(cards) {
        return await Card.insertMany(cards);
    } 
    
}
