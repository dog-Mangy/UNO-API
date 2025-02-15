export class TokenBlacklistService {
  constructor() {
    if (!TokenBlacklistService.instance) {
      this.blacklist = new Set();
      TokenBlacklistService.instance = this;
    }
    return TokenBlacklistService.instance;
  }

  add(token) {
    this.blacklist.add(token);
  }

  has(token) {
    return this.blacklist.has(token);
  }
}

export const tokenBlacklistService = new TokenBlacklistService();
