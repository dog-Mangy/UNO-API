import { CardRepository } from "../../../data/repositories/cardRepository.js";
import { GameHistoryRepository } from "../../../data/repositories/gameHistoryRepository.js";
import { GameRepository } from "../../../data/repositories/gameRepository.js";
import { generateRandomCard } from "../../../utils/cardUtils.js";
import { NotFoundError, UnauthorizedError, ValidationError, ConflictError, MethodNotAllowedError } from "../../../utils/customErrors.js";
import { getNextPlayerService } from "../game/gameService.js";
import { ScoreService } from "../score/ScoreService.js";

export class CardService {
    static async distributeCards(players, cardsPerPlayer, deck, gameId) {
        if (deck.length < players.length * cardsPerPlayer) {
            throw new ConflictError("There are not enough cards in the deck");
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
            throw new NotFoundError("Game not Found.");
        }

        if (game.status === "finished") {
            throw new ConflictError("The game has already ended");
        }
    
        if (game.players[game.turnIndex]._id.toString() !== playerId.toString()) {
            throw new MethodNotAllowedError("It's not your turn.");
        }
    
        const topCard = await CardRepository.findTopDiscardCard(gameId);
        const playedCard = await CardRepository.findById(cardId);
    
        if (!playedCard) {
            throw new NotFoundError("The card does not exist.");
        }

        if (playedCard.playerId.toString() !== playerId.toString()) {
            throw new UnauthorizedError("This card does not belong to the player.");
        }
    
        if (playedCard.color !== topCard.color && playedCard.value !== topCard.value && playedCard.color !== "wild") {
            throw new ValidationError("Invalid card. It must match in color or number.");
        }
    
        await GameHistoryRepository.logAction(gameId, playerId, `Jugó ${playedCard.color} ${playedCard.value}`);
        await CardRepository.updateById(playedCard._id, { playerId: null, discarded: true });
    
        const remainingCards = await CardRepository.getPlayerCards(playerId);
    
        if (remainingCards.length === 0) {
            const scores = await ScoreService.calculateFinalScores(gameId, playerId);
            await GameRepository.updateById(gameId, { status: "finished", winner: playerId });
    
            return {
                message: `¡${playerId} has won the game!`,
                scores
            };
        }
    
        let shouldSkip = playedCard.value === "skip";
        let shouldReverse = playedCard.value === "reverse";
    
        if (shouldReverse) {
            await GameRepository.updateById(gameId, { players: game.players.reverse() });
        }
    
        const nextPlayer = await getNextPlayerService(gameId, shouldSkip);
    
        return {
            message: shouldReverse ? "A Reverse card was played. The player order has been reversed." : "Card played successfully.",
            nextPlayer: nextPlayer.nextPlayerId
        };
    }    

    static async drawCard(playerId, gameId) {
        const game = await GameRepository.getGameWithPlayers(gameId);
    
        if (!game) {
            throw new NotFoundError("Game not found");
        }
    
        if (game.status === "finished") {
            throw new ConflictError("The game has already ended");
        }

        if (game.players[game.turnIndex]._id.toString() !== playerId.toString()) {
            throw new MethodNotAllowedError("It's not your turn.");
        }
    
        const deckCard = await CardRepository.drawFromDeck(gameId);
    
        if (!deckCard) {
            throw new NotFoundError("There are no cards in the deck.");
        }

        await GameHistoryRepository.logAction(gameId, playerId, "Drew a card");
        await CardRepository.updateById(deckCard._id, { playerId });
    
        const nextPlayer = await getNextPlayerService(gameId);
    
        return {
            message: "Card drawn. Next player's turn.",
            drawnCard: deckCard,
            nextPlayer: nextPlayer.nextPlayerId
        };
    }
    
    static async declareUno(playerId, gameId) {
        const playerCards = await CardRepository.getPlayerCards(playerId);
        
        if (playerCards.length !== 1) {
            throw new ValidationError("You can only say 'UNO' when you have exactly one card.");
        }
    
        await GameHistoryRepository.logAction(gameId, playerId, "Declared UNO");
    
        await GameRepository.updateUnoStatus(gameId, playerId, true);
    
        return { message: "UNO declared successfully!" };
    }
    
    static async challengeUno(challengerId, challengedPlayerId, gameId) {
        const game = await GameRepository.getGameWithPlayers(gameId);
        
        if (!game) {
            throw new NotFoundError("Game not found.");
        }
    
        const playerCards = await CardRepository.getPlayerCards(challengedPlayerId);
    
        if (!playerCards) {
            throw new NotFoundError("No cards were found for this player.");
        }
    
        if (playerCards.length !== 1) {
            throw new ConflictError("You cannot challenge this player because they do not have exactly one card.");
        }
    
        const unoStatusObject = Object.fromEntries(game.unoStatus); 
        const playerStatus = unoStatusObject[challengedPlayerId] ?? false;
    
        if (playerStatus) {
            throw new ConflictError("The player did declare 'UNO', you cannot challenge them.");
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
    
        if (validCards.length === 0 && newCards.length === 0) {
            throw new ConflictError("There are no cards in the deck to draw.");
        }
    
        const finalCards = validCards.concat(newCards);
    
        await Promise.all(finalCards.map(card => 
            CardRepository.updateById(card._id, { playerId: challengedPlayerId })
        ));
    
        return { message: "Successful challenge! The player forgot to say 'UNO' and has drawn 2 cards." };
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

    static async getTopDeckCard(gameId) {
        const topCard = await CardRepository.findTopDiscardCard(gameId);
    
        if (!topCard) {
            throw new NotFoundError("No hay cartas en el mazo.");
        }
    
        return {
            color: topCard.color,
            value: topCard.value
        };
    }

}    