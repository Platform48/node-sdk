/**
 * Handles authentication for JellyFaaS API.
 * Uses an API key to authenticate and fetch a JWT for subsequent calls.
 */
export declare class AIConfig {
    private static readonly AUTH_ENDPOINT;
    private static readonly HEADER_API_KEY;
    private apiKey;
    private token;
    private isAuthenticated;
    private doDebug;
    private httpClient;
    /**
     * Constructor to initialize the Config object and authenticate.
     * @param apiKey - The JellyFaaS API key.
     * @param doDebug - Whether to enable debug logging.
     * @throws Error if authentication fails.
     */
    constructor(apiKey: string, doDebug?: boolean);
    /**
     * Authenticates using the provided API key.
     * @param apiKey - The JellyFaaS API key.
     * @throws Error if authentication fails or the server response is invalid.
     */
    init(): Promise<AIConfig>;
    /**
     * Prints debug messages if debugging is enabled.
     * @param msg - The debug message to print.
     */
    private printDebug;
    /**
     * Returns the API key used for authentication.
     */
    getApiKey(): string | null;
    /**
     * Returns the JWT token after authentication.
     */
    getToken(): string | null;
    getIsAuthenticated(): boolean;
}
