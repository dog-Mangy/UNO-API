import mongoose from "mongoose";

const dataSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    genre: { type: String, required: true },
    platform: { type: String, required: true },
});

export const Book = mongoose.model("DATOS", dataSchema);
