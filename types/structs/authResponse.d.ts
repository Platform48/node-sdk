export declare class AuthResponse {
    token: string | null;
    expiry: string | null;
    constructor(token?: string, expiry?: string);
    getToken(): string | null;
    setToken(token: string): void;
    getExpiry(): string | null;
    setExpiry(expiry: string): void;
}
