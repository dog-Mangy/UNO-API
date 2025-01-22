import mongoose from "mongoose";

const dataSchema = new mongoose.Schema({
    playerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Users",
        required: true 
    },
    gameId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Games",
        required: true 
    },
    score: { type: Number, required: true },
}, { timestamps: true });

export const Score = mongoose.connection.models.Scores || mongoose.model("Scores", dataSchema);
