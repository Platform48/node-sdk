"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AIClient = void 0;
var _axios = _interopRequireDefault(require("axios"));
var _jellyFassException = require("./exceptions/jellyFassException");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Import exceptions
var QueryType = /*#__PURE__*/function (QueryType) {
  QueryType[QueryType["DIRECT"] = 0] = "DIRECT";
  QueryType[QueryType["RAG"] = 1] = "RAG";
  QueryType[QueryType["RDBMS"] = 2] = "RDBMS";
  QueryType[QueryType["FUNCTION"] = 3] = "FUNCTION";
  return QueryType;
}(QueryType || {});
class AIClient {
  static LOOKUP_ENDPOINT = 'https://api.jellyfaas.com/auth-service/v1/lookup';
  static QUERY_SERVICE_ENDPOINT = 'https://ai.jellyfaas.com/query-service/v1';
  static HEADER_API_KEY = "x-jf-apikey";
  static HEADER_TOKEN = 'jfwt';
  queryType = QueryType.DIRECT;

  // Function calling querying
  functions = [];

  // Vector DB querying

  // RDBMS querying

  constructor(config) {
    if (!config || !config.getToken()) {
      throw new _jellyFassException.JellyFaasException('Config cannot be null');
    }
    this.config = config;
    this.httpClient = _axios.default.create({
      validateStatus: function () {
        // Accept all HTTP statuses as "valid"
        // Axios won't throw for non-2xx statuses.
        return true;
      }
    });
  }
  async connectVectorDatabase(databaseName, connectionString = '') {
    if (databaseName == '') {
      throw new _jellyFassException.JellyFaasException('Invalid database name');
    }
    this.vectorDatabaseName = databaseName;
    if (connectionString != '') {
      this.vectorDatabaseConnectionString = connectionString;
    }
    this.queryType = QueryType.RAG;
    return this;
  }
  async connectRelationalDatabase(connectionString, tables) {
    if (connectionString == '') {
      throw new _jellyFassException.JellyFaasException('Invalid connection string');
    }
    if (!tables) {
      throw new _jellyFassException.JellyFaasException('Invalid tables');
    }
    this.rmdbsConnectionString = connectionString;
    this.rdbmsTables = tables;
    this.queryType = QueryType.RDBMS;
    return this;
  }
  async lookupFunction(jellyFaasFunction) {
    if (!jellyFaasFunction || typeof jellyFaasFunction !== 'object') {
      throw new _jellyFassException.JellyFaasException('Expected function object');
    }
    const functionId = jellyFaasFunction.id;
    if (!functionId) {
      throw new _jellyFassException.JellyFaasException('Expected function id');
    }
    const queryParams = {
      id: functionId
    };
    const functionVersion = jellyFaasFunction.version;
    if (functionVersion !== null && functionVersion !== undefined) {
      queryParams['version'] = functionVersion;
    }
    this.debug(`Starting lookupFunction method with functionId=${functionId}`);
    try {
      const lookupResponse = await this.httpClient.get(AIClient.LOOKUP_ENDPOINT, {
        headers: {
          [AIClient.HEADER_API_KEY]: this.config.getApiKey() ?? ''
        },
        params: queryParams
      });
      this.debug(`Received response: ${lookupResponse.status}`);
      if (lookupResponse.status < 200 || lookupResponse.status >= 300) {
        throw new _jellyFassException.JellyFaasException(`HTTP error: ${lookupResponse.status}`);
      }
      const functionDetails = {
        id: functionId,
        version: functionVersion,
        dns: lookupResponse.data.dns || null,
        requirements: lookupResponse.data.requirements || null
      };
      this.functions.push(functionDetails);
      this.debug('Successfully looked up function');
      this.queryType = QueryType.FUNCTION;
      return this;
    } catch (error) {
      if (error instanceof Error) {
        // Now TypeScript knows `error` is an instance of `Error`
        const errorMessage = error.isAxiosError ? `HTTP error occurred: ${error.message}` : `Other error occurred: ${error.message}`;
        console.error(errorMessage);
        throw new _jellyFassException.JellyFaasException(errorMessage);
      } else {
        // Handle case where the error is not an instance of Error (e.g., if it's a string or other type)
        console.error('An unknown error occurred.');
        throw new _jellyFassException.JellyFaasException('An unknown error occurred.');
      }
    }
  }
  async query(query, ragQuery = "") {
    switch (this.queryType) {
      case QueryType.DIRECT:
        return await this.directQuery(query);
      case QueryType.RAG:
        return await this.ragQuery(query, ragQuery);
      case QueryType.RDBMS:
        return await this.rdbmsQuery(query);
      case QueryType.FUNCTION:
        return await this.functionQuery(query);
    }
  }
  async rdbmsQuery(query) {
    try {
      const response = await this.httpClient.post(AIClient.QUERY_SERVICE_ENDPOINT + "/rdbms", {
        "query": query,
        "mysql_connection_string": this.rmdbsConnectionString,
        "tables": this.rdbmsTables
      }, {
        headers: {
          [AIClient.HEADER_TOKEN]: this.config.getToken() ?? ''
        }
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        // Now TypeScript knows `error` is an instance of `Error`
        const errorMessage = error.isAxiosError ? `HTTP error occurred: ${error.message}` : `Other error occurred: ${error.message}`;
        console.error(errorMessage);
        throw new _jellyFassException.JellyFaasException(errorMessage);
      } else {
        // Handle case where the error is not an instance of Error (e.g., if it's a string or other type)
        console.error('An unknown error occurred.');
        throw new _jellyFassException.JellyFaasException('An unknown error occurred.');
      }
    }
  }
  async directQuery(query) {
    try {
      const response = await this.httpClient.post(AIClient.QUERY_SERVICE_ENDPOINT + "/query", {
        "query": query
      }, {
        headers: {
          [AIClient.HEADER_TOKEN]: this.config.getToken() ?? ''
        }
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        // Now TypeScript knows `error` is an instance of `Error`
        const errorMessage = error.isAxiosError ? `HTTP error occurred: ${error.message}` : `Other error occurred: ${error.message}`;
        console.error(errorMessage);
        throw new _jellyFassException.JellyFaasException(errorMessage);
      } else {
        // Handle case where the error is not an instance of Error (e.g., if it's a string or other type)
        console.error('An unknown error occurred.');
        throw new _jellyFassException.JellyFaasException('An unknown error occurred.');
      }
    }
  }
  async ragQuery(query, ragQuery = "") {
    try {
      let body = {
        query: query,
        vector_mongo_collection: this.vectorDatabaseName
      };
      if (this.vectorDatabaseConnectionString) {
        body = {
          ...body,
          vector_mongo_connection_string: this.vectorDatabaseConnectionString
        };
      }
      if (ragQuery) {
        body = {
          ...body,
          rag_query: ragQuery
        };
      }
      const response = await this.httpClient.post(AIClient.QUERY_SERVICE_ENDPOINT + "/vectordb", body, {
        headers: {
          [AIClient.HEADER_TOKEN]: this.config.getToken() ?? ''
        }
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        // Now TypeScript knows `error` is an instance of `Error`
        const errorMessage = error.isAxiosError ? `HTTP error occurred: ${error.message}` : `Other error occurred: ${error.message}`;
        console.error(errorMessage);
        throw new _jellyFassException.JellyFaasException(errorMessage);
      } else {
        // Handle case where the error is not an instance of Error (e.g., if it's a string or other type)
        console.error('An unknown error occurred.');
        throw new _jellyFassException.JellyFaasException('An unknown error occurred.');
      }
    }
  }
  async functionQuery(query) {
    try {
      const response = await this.httpClient.post(AIClient.QUERY_SERVICE_ENDPOINT + "/function", {
        "query": query,
        "function": this.functions[0].id,
        "ai_platform": "gemini"
      }, {
        headers: {
          [AIClient.HEADER_TOKEN]: this.config.getToken() ?? ''
        }
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        // Now TypeScript knows `error` is an instance of `Error`
        const errorMessage = error.isAxiosError ? `HTTP error occurred: ${error.message}` : `Other error occurred: ${error.message}`;
        console.error(errorMessage);
        throw new _jellyFassException.JellyFaasException(errorMessage);
      } else {
        // Handle case where the error is not an instance of Error (e.g., if it's a string or other type)
        console.error('An unknown error occurred.');
        throw new _jellyFassException.JellyFaasException('An unknown error occurred.');
      }
    }
  }
  debug(message) {
    console.log(`[DEBUG] ${message}`);
  }
}
exports.AIClient = AIClient;
//# sourceMappingURL=ai_client.js.map