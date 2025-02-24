import mongoose from "mongoose";

const gameHistorySchema = new mongoose.Schema({
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Games", required: true },
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

export const GameHistory = mongoose.model("GameHistory", gameHistorySchema);
