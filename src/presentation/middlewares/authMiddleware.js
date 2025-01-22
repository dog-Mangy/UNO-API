import express from 'express';
import { userRouter } from '../routes/user.js';
import { gameRouter } from '../routes/game.js';
import { cardRouter } from '../routes/card.js';
import { scoreRouter } from '../routes/score.js';
import { menuRouter } from '../routes/menu.js';




const app = express();

// Configurar middlewares
app.use(express.json());
app.use('/users', userRouter);
app.use('/games', gameRouter);
app.use('/cards', cardRouter);
app.use('/scores', scoreRouter);
app.use('/', menuRouter);

// Exportar la aplicación configurada
export default app;
