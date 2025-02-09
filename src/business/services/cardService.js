import { Card } from "../../data/models/cardModel.js";
import { ValidationError, NotFoundError } from "../../utils/customErrors.js";

export class CardService {
    static async createCard({ color, value, playerId, gameId }) {
        if (!color || !value || !playerId || !gameId) {
            throw new ValidationError("Todos los campos son obligatorios");
        }

        const newCard = new Card({ color, value, playerId, gameId });
        await newCard.save();
        return newCard;
    }

    static async getAllCards() {
        const cards = await Card.find();
        if (!cards || cards.length === 0) {
            throw new NotFoundError("No se encontraron cartas");
        }
        return cards;
    }

    static async getCardById(id) {
        const card = await Card.findById(id);
        if (!card) {
            throw new NotFoundError("Carta no encontrada");
        }
        return card;
    }

    static async getTopDiscardCard(gameId) {
        if (!gameId) {
            throw new ValidationError("El game_id es requerido");
        }

        const topCard = await Card.findOne({ gameId }).sort({ createdAt: -1 });

        if (!topCard) {
            throw new NotFoundError("No hay cartas en la pila de descartes");
        }

        return {
            game_id: gameId,
            top_card: `${topCard.value} of ${topCard.color}`
        };
    }

    static async updateCard(id, updates) {
        try {
            const updatedCard = await Card.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    
            if (!updatedCard) {
                throw new NotFoundError("Carta no encontrada");
            }
    
            return { message: "Carta actualizada exitosamente", updatedCard };
        } catch (error) {
            if (error.name === "ValidationError") {
                throw new ValidationError("Error en los datos de la carta");
            }
            throw error; // Lanzar otros errores para que el middleware los maneje
        }
    }
    

    static async deleteCard(id) {
        const deletedCard = await Card.findByIdAndDelete(id);
        if (!deletedCard) {
            throw new NotFoundError("Carta no encontrada");
        }

        return { message: "Carta eliminada exitosamente", deletedCard };
    }
}
