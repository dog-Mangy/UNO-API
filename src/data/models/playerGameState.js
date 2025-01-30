import mongoose from "mongoose";

const playerGameStateSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    game: { type: mongoose.Schema.Types.ObjectId, ref: "Games", required: true },
    ready: { type: Boolean, default: false }, 
}, { timestamps: true });

export const PlayerGameState = mongoose.model("PlayerGameState", playerGameStateSchema);
