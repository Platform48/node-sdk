export class AuthResponse {
    public token: string | null = null;
    public expiry: string | null = null;
  
    constructor(token?: string, expiry?: string) {
      if (token) this.token = token;
      if (expiry) this.expiry = expiry;
    }
  
    public getToken(): string | null {
      return this.token;
    }
  
    public setToken(token: string): void {
      this.token = token;
    }
  
    public getExpiry(): string | null {
      return this.expiry;
    }
  
    public setExpiry(expiry: string): void {
      this.expiry = expiry;
    }
  }
  