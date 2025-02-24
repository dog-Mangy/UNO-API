import express from 'express';
import { post, getAll, get, deleted, update, getTopDiscardCard, playCard, drawnCard, declareUno, challengeUno, getPlayerHand } from '../controllers/card.js';
import { errorHandler } from '../middlewares/errorHandler.js';


export const cardRouter = express.Router()

cardRouter.post('/', post);

cardRouter.get('/', getAll);
cardRouter.get("/player/:playerId/hand", getPlayerHand);
cardRouter.get('/:id', get);
cardRouter.post('/getLastCard', getTopDiscardCard);


cardRouter.post('/challenge-uno', challengeUno);




cardRouter.put('/play', playCard);
cardRouter.put('/draw', drawnCard); 
cardRouter.put('/declare-uno', declareUno);




cardRouter.put('/:id', update);
cardRouter.patch('/:id', update);

cardRouter.delete('/:id', deleted);

cardRouter.use(errorHandler);
