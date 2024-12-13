import axios, { AxiosInstance, AxiosResponse } from "axios";
import { AuthResponse } from "./structs/authResponse"; // Importing the AuthResponse class

/**
 * Handles authentication for JellyFaaS API.
 * Uses an API key to authenticate and fetch a JWT for subsequent calls.
 */
export class AIConfig {
  private static readonly AUTH_ENDPOINT = "https://api.jellyfaas.com/auth-service/v1/validate";
  private static readonly HEADER_API_KEY = "x-jf-apikey";

  private apiKey: string | null = null;
  private token: string | null = null;
  private isAuthenticated: boolean = false;
  private doDebug: boolean;
  private httpClient: AxiosInstance;

  /**
   * Constructor to initialize the Config object and authenticate.
   * @param apiKey - The JellyFaaS API key.
   * @param doDebug - Whether to enable debug logging.
   * @throws Error if authentication fails.
   */
  constructor(apiKey: string, doDebug: boolean = false) {
    this.doDebug = doDebug;
    this.httpClient = axios.create({
      validateStatus: function () {
          // Accept all HTTP statuses as "valid"
          // Axios won't throw for non-2xx statuses.
          return true;
        },
      });
    this.apiKey = apiKey    
    return (async ()=> {
      await this.init()
      return this;
    })() as unknown as AIConfig;
  }

  /**
   * Authenticates using the provided API key.
   * @param apiKey - The JellyFaaS API key.
   * @throws Error if authentication fails or the server response is invalid.
   */
  public async init(): Promise<AIConfig> {
    this.printDebug(`Starting auth() method with api_key = ${this.apiKey}`);

    try {
      const headers = {
        [AIConfig.HEADER_API_KEY]: this.apiKey ?? '',
      };

      const response: AxiosResponse = await this.httpClient.get(AIConfig.AUTH_ENDPOINT, { headers });

      if (response.status === 401) {
        throw new Error("HTTP error occurred: 401\nInvalid API key");
      }

      if (response.status !== 200) {
        throw new Error(`HTTP error occurred: ${response.status}`);
      }

      // Deserialize the response into an AuthResponse object
      const authResponse: AuthResponse = new AuthResponse(response.data.token, response.data.expiry);

      if (!authResponse.token) {
        throw new Error("Received invalid authentication data from the server");
      }

      this.token = authResponse.token;
      this.isAuthenticated = true;

      this.printDebug("Successfully authenticated");
    } catch (error) {
      this.printDebug(`Error during authentication: ${error}`);
      throw error;
    } finally {
      this.printDebug("Finished auth() method");
    }
    return this;
  }

  /**
   * Prints debug messages if debugging is enabled.
   * @param msg - The debug message to print.
   */
  private printDebug(msg: string): void {
    if (this.doDebug) {
      console.log(msg);
    }
  }

  /**
   * Returns the API key used for authentication.
   */
  public getApiKey(): string | null {
    return this.apiKey;
  }

  /**
   * Returns the JWT token after authentication.
   */
  public getToken(): string | null {
    return this.token;
  }

  public getIsAuthenticated(): boolean {
    return this.isAuthenticated
  }
}
