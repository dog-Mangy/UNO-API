import express from "express";
import { getGameHistory } from "../controllers/GameHistory.js";
import { errorHandler } from "../middlewares/errorHandler.js";

export const gameHistoryRouter = express.Router();

gameHistoryRouter.get("/games/:gameId/history", getGameHistory);

gameHistoryRouter.use(errorHandler);
