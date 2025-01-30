import express from "express";
import { updateReadyState } from "../controllers/gameState.js";

const GameStatusRouter = express.Router();

GameStatusRouter.put("/:gameId/ready", updateReadyState);

export default GameStatusRouter;
