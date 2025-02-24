import { CardRepository } from "../../../data/repositories/cardRepository.js";
import { GameHistoryRepository } from "../../../data/repositories/gameHistoryRepository.js";
import { GameRepository } from "../../../data/repositories/gameRepository.js";
import { generateRandomCard } from "../../../utils/cardUtils.js";
import { ValidationError } from "../../../utils/customErrors.js";
import { getNextPlayerService } from "../gameService.js";
import { ScoreService } from "../score/ScoreService.js";

export class CardService {
    static async distributeCards(players, cardsPerPlayer, deck, gameId) {
        if (deck.length < players.length * cardsPerPlayer) {
            throw new Error("No hay suficientes cartas en el mazo");
        }
    
        let playerIndex = 0;
    
        const distribute = async (remainingCards) => {
            if (remainingCards === 0) return;
    
            const card = deck.pop(); 
            await CardRepository.updateById(card._id, { playerId: players[playerIndex] });
    
            playerIndex = (playerIndex + 1) % players.length; 
            await distribute(remainingCards - 1); 
        };
    
        await distribute(players.length * cardsPerPlayer);
    }


    static async playCard(playerId, gameId, cardId) {
        const game = await GameRepository.getGameWithPlayers(gameId);
    
        if (!game) {
            throw new ValidationError("Juego no encontrado.");
        }
    
        if (game.players[game.turnIndex]._id.toString() !== playerId.toString()) {
            throw new ValidationError("No es tu turno.");
        }
    
        const topCard = await CardRepository.findTopDiscardCard(gameId);
        const playedCard = await CardRepository.findById(cardId);
    
        if (!playedCard || playedCard.playerId.toString() !== playerId.toString()) {
            throw new ValidationError("Esta carta no pertenece al jugador.");
        }
    
        if (playedCard.color !== topCard.color && playedCard.value !== topCard.value && playedCard.color !== "wild") {
            throw new ValidationError("Carta inválida. Debe coincidir en color o número.");
        }

        await GameHistoryRepository.logAction(gameId, playerId, `Jugó ${playedCard.color} ${playedCard.value}`);

        await CardRepository.updateById(playedCard._id, { playerId: null, discarded: true });
    
        const remainingCards = await CardRepository.getPlayerCards(playerId);
        
        if (remainingCards.length === 0) {
            const scores = await ScoreService.calculateFinalScores(gameId, playerId);
            await GameRepository.updateById(gameId, { status: "finished", winner: playerId });
    
            return {
                message: `¡${playerId} ha ganado el juego!`,
                scores
            };
        }
    
        const nextPlayer = await getNextPlayerService(gameId);
    
        return {
            message: "Carta jugada con éxito.",
            nextPlayer: nextPlayer.nextPlayerId
        };
    }
    

    static async drawCard(playerId, gameId) {
        const game = await GameRepository.getGameWithPlayers(gameId);
    
        if (!game) {
            throw new ValidationError("Juego no encontrado.");
        }
    
        if (game.players[game.turnIndex]._id.toString() !== playerId.toString()) {
            throw new ValidationError("No es tu turno.");
        }
    
        const deckCard = await CardRepository.drawFromDeck(gameId);
    
        if (!deckCard) {
            throw new ValidationError("No hay cartas en el mazo.");
        }

        await GameHistoryRepository.logAction(gameId, playerId, "Robó una carta");
    
        await CardRepository.updateById(deckCard._id, { playerId });
    
        const nextPlayer = await getNextPlayerService(gameId);
    
        return {
            message: "Carta robada. Turno del siguiente jugador.",
            drawnCard: deckCard,
            nextPlayer: nextPlayer.nextPlayerId
        };
    }    
    
    
    static async declareUno(playerId, gameId) {
        const playerCards = await CardRepository.getPlayerCards(playerId);
        
        if (playerCards.length !== 1) {
            throw new ValidationError("Solo puedes decir 'UNO' cuando tienes exactamente una carta.");
        }

        await GameHistoryRepository.logAction(gameId, playerId, "Declaro Uno");

    
        await GameRepository.updateUnoStatus(gameId, playerId, true);
    
        return { message: "¡UNO declarado correctamente!" };
    }

    static async challengeUno(challengerId, challengedPlayerId, gameId) {
        const game = await GameRepository.getGameWithPlayers(gameId);
        
        if (!game) {
            throw new ValidationError("Juego no encontrado.");
        }
    
        const playerCards = await CardRepository.getPlayerCards(challengedPlayerId);
    
        if (playerCards.length !== 1) {
            throw new ValidationError("No puedes desafiar a este jugador, ya que no tiene una sola carta.");
        }
    
        const unoStatusObject = Object.fromEntries(game.unoStatus); 
        const playerStatus = unoStatusObject[challengedPlayerId] ?? false;

     
        if (playerStatus) {
            throw new ValidationError("El jugador sí declaró 'UNO', no puedes desafiarlo.");
        }
    
        const drawnCards = await Promise.all([
            CardRepository.drawFromDeck(gameId),
            CardRepository.drawFromDeck(gameId)
        ]);
        
        const validCards = drawnCards.filter(card => card !== null);
        
        const missingCards = 2 - validCards.length;
        const newCards = missingCards > 0 
            ? await Promise.all(Array(missingCards).fill(null).map(() => 
                CardRepository.create(generateRandomCard(gameId, challengedPlayerId))
            ))
            : [];
        
        const finalCards = validCards.concat(newCards);
        
        await Promise.all(finalCards.map(card => 
            CardRepository.updateById(card._id, { playerId: challengedPlayerId })
        ));
        
        return { message: "¡Desafío exitoso! El jugador olvidó decir 'UNO' y ha robado 2 cartas." };
    } 

    static async getPlayerHand(playerId) {
        const playerCards = await CardRepository.getPlayerCards(playerId);
    
        if (!playerCards || playerCards.length === 0) {
            return { player: playerId, hand: [] };
        }
    
        const formattedHand = playerCards.map(card => `${card.color} ${card.value}`);
    
        return {
            player: playerId,
            hand: formattedHand
        };
    }
    
    
}