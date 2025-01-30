import mongoose from "mongoose";

const dataSchema = new mongoose.Schema({
    color: { type: String, required: true },
    value: { type: String, required: true },
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
}, { timestamps: true });

export const Card = mongoose.connection.models.Cards || mongoose.model("Cards", dataSchema);
