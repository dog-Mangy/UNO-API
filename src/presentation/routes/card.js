import express from 'express';
import { post, getAll, get, deleted, update, getTopDiscardCard, playCard, drawnCard, declareUno, challengeUno, getPlayerHand, getTopDeckCard } from '../controllers/card.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';


export const cardRouter = express.Router()

cardRouter.post('/', post);

cardRouter.get('/', getAll);
cardRouter.get("/hand", authenticateJWT, getPlayerHand); 
cardRouter.get('/:id', get);
cardRouter.get("/:gameId/top-deck", getTopDeckCard);


cardRouter.get('/getLastCard/:gameId', getTopDeckCard);


cardRouter.post('/challenge-uno', challengeUno);




cardRouter.put('/play', playCard);
cardRouter.put('/draw', drawnCard); 
cardRouter.put('/declare-uno', declareUno);




cardRouter.put('/:id', update);
cardRouter.patch('/:id', update);

cardRouter.delete('/:id', deleted);

cardRouter.use(errorHandler);
