import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AuthStrategy } from "./AuthStrategy.js";

dotenv.config();
const KEY = process.env.SECRET_KEY;

export class JwtStrategy extends AuthStrategy {
  authenticate(user) {
    return jwt.sign({ id: user.id, email: user.email }, KEY, { expiresIn: "1h" });
  }
}
