import express from 'express';
import { post, getAll, get, deleted, update, getScores } from '../controllers/score.js';
import { errorHandler } from '../middlewares/errorHandler.js';


export const scoreRouter = express.Router()

scoreRouter.post('/', post);

scoreRouter.get('/', getAll);
scoreRouter.get('/:id', get);
scoreRouter.get('/ScoresPlayers/:game_id', getScores);



scoreRouter.put('/:id', update);
scoreRouter.patch('/:id', update);

scoreRouter.delete('/:id', deleted);

scoreRouter.use(errorHandler);
