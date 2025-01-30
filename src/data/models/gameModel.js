import mongoose from "mongoose";

const dataSchema = new mongoose.Schema({
    title: { type: String, required: true },
    status: { type: String, enum: ["pending", "started", "finished"], required: true },
    maxPlayers: { type: Number, required: true },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }], // Lista de jugadores
    turnIndex: { type: Number, default: 0 }, // Índice del jugador actual
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true }  
}, { timestamps: true });

export const Game = mongoose.connection.models.Games || mongoose.model("Games", dataSchema);
