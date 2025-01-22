import express from 'express';
import { post, getAll, get, deleted, update } from '../controllers/game.js';
import { errorHandler } from '../middlewares/errorHandler.js';


export const gameRouter = express.Router()

gameRouter.post('/', post);

gameRouter.get('/', getAll);
gameRouter.get('/:id', get);


gameRouter.put('/:id', update);
gameRouter.patch('/:id', update);

gameRouter.delete('/:id', deleted);

gameRouter.use(errorHandler);
