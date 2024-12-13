"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AIConfig = void 0;
var _axios = _interopRequireDefault(require("axios"));
var _authResponse = require("./structs/authResponse");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Importing the AuthResponse class

/**
 * Handles authentication for JellyFaaS API.
 * Uses an API key to authenticate and fetch a JWT for subsequent calls.
 */
class AIConfig {
  static AUTH_ENDPOINT = "https://api.jellyfaas.com/auth-service/v1/validate";
  static HEADER_API_KEY = "x-jf-apikey";
  apiKey = null;
  token = null;
  isAuthenticated = false;
  /**
   * Constructor to initialize the Config object and authenticate.
   * @param apiKey - The JellyFaaS API key.
   * @param doDebug - Whether to enable debug logging.
   * @throws Error if authentication fails.
   */
  constructor(apiKey, doDebug = false) {
    this.doDebug = doDebug;
    this.httpClient = _axios.default.create({
      validateStatus: function () {
        // Accept all HTTP statuses as "valid"
        // Axios won't throw for non-2xx statuses.
        return true;
      }
    });
    this.apiKey = apiKey;
    return (async () => {
      await this.init();
      return this;
    })();
  }

  /**
   * Authenticates using the provided API key.
   * @param apiKey - The JellyFaaS API key.
   * @throws Error if authentication fails or the server response is invalid.
   */
  async init() {
    this.printDebug(`Starting auth() method with api_key = ${this.apiKey}`);
    try {
      const headers = {
        [AIConfig.HEADER_API_KEY]: this.apiKey ?? ''
      };
      const response = await this.httpClient.get(AIConfig.AUTH_ENDPOINT, {
        headers
      });
      if (response.status === 401) {
        throw new Error("HTTP error occurred: 401\nInvalid API key");
      }
      if (response.status !== 200) {
        throw new Error(`HTTP error occurred: ${response.status}`);
      }

      // Deserialize the response into an AuthResponse object
      const authResponse = new _authResponse.AuthResponse(response.data.token, response.data.expiry);
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
  printDebug(msg) {
    if (this.doDebug) {
      console.log(msg);
    }
  }

  /**
   * Returns the API key used for authentication.
   */
  getApiKey() {
    return this.apiKey;
  }

  /**
   * Returns the JWT token after authentication.
   */
  getToken() {
    return this.token;
  }
  getIsAuthenticated() {
    return this.isAuthenticated;
  }
}
exports.AIConfig = AIConfig;
//# sourceMappingURL=ai_config.js.map