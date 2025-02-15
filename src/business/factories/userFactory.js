import { UserHasher } from "../../utils/userHasher.js";

export class UserFactory {
    static async createUser({ name, age, email, password }) {
      const hashedPassword = await UserHasher.hashPassword(password);
      return { name, age, email, password: hashedPassword };
    }
  }