import express from 'express';
import { post, getAll, get, deleted, update, getTopDiscardCard } from '../controllers/card.js';
import { errorHandler } from '../middlewares/errorHandler.js';


export const cardRouter = express.Router()

cardRouter.post('/', post);

cardRouter.get('/', getAll);
cardRouter.get('/:id', get);
cardRouter.post('/getLastCard', getTopDiscardCard);



cardRouter.put('/:id', update);
cardRouter.patch('/:id', update);

cardRouter.delete('/:id', deleted);

cardRouter.use(errorHandler);
