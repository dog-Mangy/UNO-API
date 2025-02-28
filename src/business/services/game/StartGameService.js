import { CardRepository } from "../../../data/repositories/cardRepository.js";
import { GameRepository } from "../../../data/repositories/gameRepository.js";
import { PlayerGameStateRepository } from "../../../data/repositories/playerGameStateRepository.js";
import { authenticateUser } from "../../../utils/authentificate.js";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../../utils/customErrors.js";
import { CardService } from "../card/CardService.js";

async function validateStartGameParams(game_id, access_token) {
    if (!game_id || !access_token) {
      throw new ValidationError("Missing required parameters");
    }
  }
  
  async function getGameOrThrow(game_id) {
    const game = await GameRepository.findById(game_id);
    if (!game) {
      throw new NotFoundError("Game not found");
    }
    return game;
  }
  
  function authenticateOrThrow(access_token) {
    const authResult = authenticateUser(access_token);
    if (authResult.status !== 200) {
      throw new UnauthorizedError("Invalid or expired token");
    }
    return authResult.userId;
  }
  
  function validateGameCreator(game, userId) {
    if (game.creator.toString() !== userId) {
      throw new UnauthorizedError("You do not have permission to start this game");
    }
  }
  
  async function validatePlayersReady(game_id) {
    const playersReadyState = await PlayerGameStateRepository.findByGameId(game_id);
    const allReady = playersReadyState.every(player => player.ready);
    if (!allReady) {
      throw new ValidationError("Not all players are ready");
    }
    return playersReadyState;
  }
  
  async function handleDeckAndDistributeCards(game_id, players) {
    let deck = await CardRepository.findAllInDeck(game_id);
    if (deck.length === 0) {
      throw new Error("No hay cartas en el mazo para iniciar el juego.");
    }
    const firstCard = deck.pop();
    await CardRepository.updateById(firstCard._id, { discarded: true });
    deck = await CardRepository.findAllInDeck(game_id);
    await CardService.distributeCards(players, 2, deck, game_id);
    return firstCard;
  }
  
  export const startGameService = async (game_id, access_token) => {
    await validateStartGameParams(game_id, access_token);
    
    const game = await getGameOrThrow(game_id);
    
    const userId = authenticateOrThrow(access_token);
    
    validateGameCreator(game, userId);
    
    const playersReadyState = await validatePlayersReady(game_id);
    
    if (playersReadyState.length === 0) {
        throw new ValidationError("No hay jugadores en la partida. No se puede iniciar el juego.");
    }

    const updatedGame = await GameRepository.updateStatus(game_id, "started");
    
    const players = playersReadyState.map(player => player.user.toString());
    
    const firstCard = await handleDeckAndDistributeCards(game_id, players);
    
    return { 
      status: 200, 
      body: { message: "Game started successfully", firstCard },
      updatedGame 
    };
};
