import mongoose from "mongoose";
import validator from "validator";

const dataSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    email: { 
        type: String, 
        required: true, 
        validate: {
            validator: validator.isEmail,
            message: 'El correo electrónico no es válido',
        },
    },
    password: { type: String, required: true },
}, { timestamps: true });

export const Player = mongoose.connection.models.Users || mongoose.model("Users", dataSchema);
