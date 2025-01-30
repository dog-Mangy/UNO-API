import mongoose from "mongoose";
import { Game } from "../data/models/gameModel.js";

export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const findGameById = async (id) => {
    if (!isValidObjectId(id)) return null;
    return await Game.findById(id);
};
