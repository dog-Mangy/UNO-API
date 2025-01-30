import express from "express";
import { authenticateJWT } from "../middlewares/authMiddleware.js";
import { getUserProfile } from "../controllers/profile.js";
import { errorHandler } from "../middlewares/errorHandler.js";

export const profileRouter = express.Router();

profileRouter.get("/", authenticateJWT, getUserProfile);

profileRouter.use(errorHandler);
