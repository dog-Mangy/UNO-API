import { AuthStrategy } from "./AuthStrategy";

export class OAuthStrategy extends AuthStrategy {
  authenticate(user) {
    return `OAuthTokenFor-${user.email}`; 
  }
}
