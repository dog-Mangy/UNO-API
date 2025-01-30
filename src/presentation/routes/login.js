import express from "express";
import { login } from "../controllers/auth.js";
import { errorHandler } from "../middlewares/errorHandler.js";

export const loginRouter = express.Router();

loginRouter.post("/", login);

loginRouter.use(errorHandler);