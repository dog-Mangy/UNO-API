import { NotFoundError, ValidationError } from "../../utils/customErrors.js";

class UserService {
  constructor(userRepository, userValidator, passwordService, userFactory) {
    this.userRepository = userRepository;
    this.userValidator = userValidator;
    this.passwordService = passwordService;
    this.userFactory = userFactory;
  }

  async registerUser(userData) {
    this.userValidator.validateRegistration(userData);
    await this.userValidator.ensureUserDoesNotExist(userData.email, userData.name);

    const newUserData = await this.userFactory.createUser(userData);
    const newUser = await this.userRepository.createUser(newUserData);

    return { message: "User registered successfully", user: newUser };
  }

  async authenticateUser({ email, password }) {
    const user = await this.findUserByEmail(email); 
    await this.passwordService.verify(password, user.password); 
    return user;
  }

  async findUserByEmail(email) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async getUserById(id) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }

  async getAllUsers() {
    const users = await this.userRepository.findAll();
    if (!users || users.length === 0) throw new NotFoundError("No players found");
    return users;
  }

  async updateUser(id, updates) {
    if (!updates || Object.keys(updates).length === 0) {
      throw new ValidationError("You must provide at least one field to update");
    }

    const updatedUser = await this.userRepository.updateById(id, updates);
    if (!updatedUser) throw new NotFoundError("Player not found");

    return { message: "Player successfully updated", updatedUser };
  }

  async deleteUser(id) {
    const deletedUser = await this.userRepository.deleteById(id);
    if (!deletedUser) throw new NotFoundError("Player not found");

    return { message: "Player successfully eliminated", deletedUser };
  }
}

export default UserService;