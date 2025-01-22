import express from 'express';
import { errorHandler } from '../middlewares/errorHandler.js';
import { post, getAll, get, updateUser, deleteUser } from '../controllers/user.js';


export const userRouter = express.Router()

userRouter.post('/', post);

userRouter.get('/', getAll);
userRouter.get('/:id', get);


userRouter.put('/:id', updateUser);
userRouter.patch('/:id', updateUser);

userRouter.delete('/:id', deleteUser);

userRouter.use(errorHandler);
