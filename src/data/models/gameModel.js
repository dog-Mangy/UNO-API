import mongoose from "mongoose";

const dataSchema = new mongoose.Schema({
    title: { type: String, required: true },
    status: { type: String, enum: ["pending", "started", "finished"], required: true, default: "pending" }, 
    maxPlayers: { type: Number, required: true },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }], 
    turnIndex: { type: Number, default: 0 }, 
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    unoStatus: { type: Map, of: Boolean, default: {} }
}, { timestamps: true });

export const Game = mongoose.connection.models.Games || mongoose.model("Games", dataSchema);