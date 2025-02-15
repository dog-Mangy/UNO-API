import { Player } from "../models/userModel.js";

export class UserRepository {
    
    static async findByEmailOrName(email, name) {
        return await Player.findOne({ $or: [{ email }, { name }] });
    }

    static async createUser(userData) {
        const newUser = new Player(userData);
        return await newUser.save();
    }

    static async findByEmail(email) {
        return await Player.findOne({ email });
    }

    static async findById(id) {
        return await Player.findById(id);
    }

    static async findAll() {
        return await Player.find();
    }

    static async updateById(id, updates) {
        return await Player.findByIdAndUpdate(id, updates, { new: true });
    }

    static async deleteById(id) {
        return await Player.findByIdAndDelete(id);
    }
}

