import express from 'express';
import { gameRouter } from './presentation/routes/game.js';
import { cardRouter } from './presentation/routes/card.js';
import { scoreRouter } from './presentation/routes/score.js';
import { menuRouter } from './presentation/routes/menu.js';
import { loginRouter } from './presentation/routes/login.js';
import { userRouter } from './presentation/routes/user.js';
import { logoutRouter } from './presentation/routes/logOut.js';
import { profileRouter } from './presentation/routes/profile.js';
import { errorHandler } from './presentation/middlewares/errorHandler.js';
import { GameStatusRouter } from './presentation/routes/playerGameState.js';
import { gameHistoryRouter } from './presentation/routes/gameHistory.js';
import { createCacheMiddleware } from './presentation/middlewares/CacheMiddleware.js';



const app = express();
const cacheMiddleware = createCacheMiddleware({ max: 2, maxAge: 30000 });


app.use(express.json());
if (process.env.NODE_ENV !== "test") {
    app.use(cacheMiddleware);
}


app.use("/auth", loginRouter);
app.use("/GameStatus", GameStatusRouter);
app.use("/logOut", logoutRouter);
app.use("/profile", profileRouter);
app.use('/users', userRouter);
app.use('/games', gameRouter);
app.use('/cards', cardRouter);
app.use('/scores', scoreRouter);
app.use('/gameHistory', gameHistoryRouter)
app.use('/', menuRouter);

app.use(errorHandler); 


export default app;
