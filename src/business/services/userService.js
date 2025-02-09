import { Player } from "../../data/models/userModel.js";
import bcrypt from "bcrypt";
import { NotFoundError } from "../../utils/customErrors.js";

class UserService {

  static async registerUser(userData) {
    const { name, age, email, password } = userData;

    const existingPlayer = await Player.findOne({
        $or: [{ email }, { name }]
    });

    if (existingPlayer) {
        if (existingPlayer.email === email) {
            throw new Error("Email already registered");
        }
        if (existingPlayer.name === name) {
            throw new Error("Username already registered");
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Player({
        name,
        age,
        email,
        password: hashedPassword
    });

    await newUser.save();
    return { message: "User registered successfully", user: newUser };
  }

    static async authenticateUser({ email, password }) {
        const user = await Player.findOne({ email });

        if (!user) {
            return null; 
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return null; 
        }

        return user;
    }

    static async getUserById(id) {
        return await Player.findById(id);
    }

    static async getAllUsers() {
        return await Player.find();
    }

    static async updateUser(id, updates) {
        return await Player.findByIdAndUpdate(id, updates, { new: true });
    }

    static async deleteUser(id) {
      const deletedPlayer = await Player.findByIdAndDelete(id);
      if (!deletedPlayer) {
          throw new NotFoundError("Jugador no encontrado");
      }
      return { message: "Jugador eliminado exitosamente", deletePlayer: deletedPlayer };
    }
  
}

export default UserService;