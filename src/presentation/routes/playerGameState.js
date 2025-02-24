import express from "express";
import { updateReadyState } from "../controllers/gameState.js";
import { errorHandler } from "../middlewares/errorHandler.js";

export const GameStatusRouter = express.Router();

GameStatusRouter.put("/:gameId/ready", updateReadyState);

GameStatusRouter.use(errorHandler);
