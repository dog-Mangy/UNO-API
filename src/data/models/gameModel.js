import mongoose from "mongoose";

const dataSchema = new mongoose.Schema({
    title: { type: String, required: true },
    status: { type: Boolean, required: true },
    maxPlayers: { type: Number, required: true },
}, { timestamps: true });

export const Game = mongoose.connection.models.Games || mongoose.model("Games", dataSchema);
