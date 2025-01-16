import express from 'express';
import { start } from "../controllers/menu.js";

export const menuRouter = express.Router()

menuRouter.get('/', start);
