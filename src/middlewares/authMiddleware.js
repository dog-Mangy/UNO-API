import express from 'express';
import bodyParser from 'body-parser';
import { gameRouter } from '../routes/book.js';
import { menuRouter } from '../routes/menu.js';

const app = express();

// Configurar middlewares
app.use(bodyParser.json());
app.use('/games', gameRouter);
app.use('/', menuRouter);

// Exportar la aplicación configurada
export default app;
