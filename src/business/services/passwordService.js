import bcrypt from "bcrypt";
import { ValidationError } from "../../utils/customErrors.js";

export class PasswordService {
    static async verify(inputPassword, storedPassword) {
      const isMatch = await bcrypt.compare(inputPassword, storedPassword);
      if (!isMatch) {
        throw new ValidationError("Invalid credentials");
      }
    }
  }