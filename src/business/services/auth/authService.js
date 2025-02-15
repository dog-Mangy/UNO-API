import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { NotFoundError, ValidationError } from "../../../utils/customErrors.js";

dotenv.config();

export class AuthService {
  constructor(authStrategy, blacklistService, userService) {
    if (!authStrategy || !blacklistService || !userService) {
      throw new Error("authStrategy, blacklistService, and userService are required");
    }
    this.authStrategy = authStrategy;
    this.blacklistService = blacklistService;
    this.userService = userService;
  }

  async authenticate({ email, password }) {
    validateCredentials({ email, password });

    const user = await this.userService.authenticateUser({ email, password });

    if (!user) {
      throw new NotFoundError("Invalid credentials");
    }

    const token = this.authStrategy.authenticate(user);

    return { message: "Login successful", token };
  }

  async logout(token) {
    try {
      jwt.verify(token, process.env.SECRET_KEY);
      this.blacklistService.add(token);
      return { message: "Logout successful" };
    } catch (error) {
      throw new ValidationError("Invalid token");
    }
  }
}

const validateCredentials = ({ email, password }) => {
  if (!email || !password) {
    throw new ValidationError("Email and password are required");
  }
};
