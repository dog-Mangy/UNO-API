import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
    color: { type: String, required: true },
    value: { type: String, required: true },
    playerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Users",
        default: null 
    },
    gameId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Games",
        required: true 
    },
    discarded: { type: Boolean, default: false } 
}, { timestamps: true });

export const Card = mongoose.models.Cards || mongoose.model("Cards", cardSchema);
