import express from 'express';
import { post, getAll, get, deleted, update, joinGame, startGame, leaveGame, endGame, getStatus, getPlayers, getCurrentPlayer, getCreator } from '../controllers/game.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';


export const gameRouter = express.Router()

gameRouter.post('/', authenticateJWT , post);
gameRouter.post("/:gameId/join", authenticateJWT, joinGame);
gameRouter.post("/:gameId/leave", authenticateJWT, leaveGame);
gameRouter.post("/start", authenticateJWT, startGame);
gameRouter.post("/end", authenticateJWT, endGame);
gameRouter.post('/current-player', getCurrentPlayer);


gameRouter.get('/', getAll);
gameRouter.get('/:id', get);

gameRouter.get('/:id/status', getStatus);
gameRouter.get('/:id/players', getPlayers);
gameRouter.get('/:id/creator', getCreator);



 
gameRouter.put('/:id', update);
gameRouter.patch('/:id', update);

gameRouter.delete('/:id', deleted);

gameRouter.use(errorHandler);
