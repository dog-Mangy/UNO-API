import express from 'express';
import { post, getAll, get, deleteGame, updateGame } from '../controllers/book.js';
import { errorHandler } from '../middlewares/errorHandler.js';


export const gameRouter = express.Router()

gameRouter.post('/', post);

gameRouter.get('/', getAll);
gameRouter.get('/:id', get);


gameRouter.put('/:id', updateGame);
gameRouter.patch('/:id', updateGame);

gameRouter.delete('/:id', deleteGame);

gameRouter.use(errorHandler);
