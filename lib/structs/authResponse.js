"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthResponse = void 0;
class AuthResponse {
  token = null;
  expiry = null;
  constructor(token, expiry) {
    if (token) this.token = token;
    if (expiry) this.expiry = expiry;
  }
  getToken() {
    return this.token;
  }
  setToken(token) {
    this.token = token;
  }
  getExpiry() {
    return this.expiry;
  }
  setExpiry(expiry) {
    this.expiry = expiry;
  }
}
exports.AuthResponse = AuthResponse;
//# sourceMappingURL=authResponse.js.map