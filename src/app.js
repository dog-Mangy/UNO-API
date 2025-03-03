import express from "express";
import cors from "cors";
import { gameRouter } from "./presentation/routes/game.js";
import { cardRouter } from "./presentation/routes/card.js";
import { scoreRouter } from "./presentation/routes/score.js";
import { menuRouter } from "./presentation/routes/menu.js";
import { loginRouter } from "./presentation/routes/login.js";
import { userRouter } from "./presentation/routes/user.js";
import { logoutRouter } from "./presentation/routes/logOut.js";
import { profileRouter } from "./presentation/routes/profile.js";
import { errorHandler } from "./presentation/middlewares/errorHandler.js";
import { GameStatusRouter } from "./presentation/routes/playerGameState.js";
import { gameHistoryRouter } from "./presentation/routes/gameHistory.js";
import { createCacheMiddleware } from "./presentation/middlewares/CacheMiddleware.js";
import { trackingMiddleware } from "./presentation/middlewares/trackingMiddleware.js";
import { trackingRouter } from "./presentation/routes/tracking.js";

const app = express();

app.use(cors({  
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("*", cors()); // Para manejar preflight requests

app.use(express.json());

app.use(trackingMiddleware); 

const cacheMiddleware = createCacheMiddleware({ max: 2, maxAge: 30000 });

if (process.env.NODE_ENV !== "test") {
    app.use(cacheMiddleware);
}

// Definir las rutas DESPUÉS de configurar CORS
app.use("/auth", loginRouter);
app.use("/GameStatus", GameStatusRouter);
app.use("/logOut", logoutRouter);
app.use("/profile", profileRouter);
app.use("/users", userRouter);
app.use("/games", gameRouter);
app.use("/cards", cardRouter);
app.use("/scores", scoreRouter);
app.use("/gameHistory", gameHistoryRouter);
app.use("/menu", menuRouter);
app.use("/stats", trackingRouter);



app.use(errorHandler); 

export default app;
