import { UserRepository } from "../../data/repositories/userRepository.js";
import { ValidationError } from "../../utils/customErrors.js";

export class UserValidator {
    static validateRegistration(userData) {
        const { name, age, email, password } = userData;
        
        if (!name || !age || !email || !password) {
            throw new ValidationError("All fields are required");
        }

        if (typeof name !== "string" || name.length < 3) {
            throw new ValidationError("The name must be at least 3 characters long");
        }

        if (!this.isValidEmail(email)) {
            throw new ValidationError("Invalid email");
        }

        if (password.length < 6) {
            throw new ValidationError("The password must be at least 6 characters long");
        }
    }

    static async ensureUserDoesNotExist(email, name) {
        const existingUser = await UserRepository.findByEmailOrName(email, name);
        if (existingUser) {
            if (existingUser.email === email) throw new ValidationError("Email already registered");
            if (existingUser.name === name) throw new ValidationError("Username already registered");
        }
    }

    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
