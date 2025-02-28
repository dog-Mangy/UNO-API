import { ValidationError } from "../../../utils/customErrors.js";

export class AuthStrategy {
    authenticate(user) {
      throw new ValidationError("Method 'authenticate' must be implemented.");
    }
  }
  