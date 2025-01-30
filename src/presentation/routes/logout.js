import express from "express";
import { logout } from "../controllers/auth.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";
import { errorHandler } from "../middlewares/errorHandler.js";

export const logoutRouter = express.Router();

logoutRouter.post("/",authenticateJWT, logout);

logoutRouter.use(errorHandler);
