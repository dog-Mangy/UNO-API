import { UserFactory } from "../business/factories/userFactory.js";
import { AuthService } from "../business/services/auth/authService.js";
import { PasswordService } from "../business/services/passwordService.js";
import { TokenBlacklistService } from "../business/services/tokenBlacklistService.js";
import UserService from "../business/services/userService.js";
import { UserValidator } from "../business/validators/userValidator.js";
import { UserRepository } from "../data/repositories/userRepository.js";
import { JwtStrategy } from "../business/services/auth/JwtStrategy.js";


export const userService = new UserService(UserRepository, UserValidator, PasswordService, UserFactory);
const tokenBlacklistService = new TokenBlacklistService();
export const authService = new AuthService(new JwtStrategy(), tokenBlacklistService, userService);
