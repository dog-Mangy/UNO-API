import bcrypt from "bcrypt";

export class UserHasher {
  static async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }
}