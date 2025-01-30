import { Player } from "../../data/models/userModel.js";

class UserService {
  static async registerUser(userData) {
    const { name, email } = userData;

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

    const newUser = new Player(userData);
    await newUser.save();
    return { message: "User registered successfully", user: newUser };
  }

  static async authenticateUser({ email, password }) {
    const user = await Player.findOne({ email });

    if (!user || user.password !== password) {
      return null;
    }

    return user;
  }

  static async getUserById(id) {
    return await Player.findById(id);
  }
}


export default UserService;