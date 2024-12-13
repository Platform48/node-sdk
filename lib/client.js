"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Client = void 0;
var _axios = _interopRequireDefault(require("axios"));
var _ = _interopRequireDefault(require("ajv/dist/2020"));
var _functionRequirements = require("./structs/functionRequirements");
var _functionRequirementsBodyType = require("./structs/functionRequirementsBodyType");
var _jellyFassException = require("./exceptions/jellyFassException");
var _fs = require("fs");
var path = _interopRequireWildcard(require("path"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Assuming the Config class is implemented
// Import necessary types

// Import exceptions

class Client {
  static LOOKUP_ENDPOINT = 'https://api.jellyfaas.com/auth-service/v1/lookup';
  static HEADER_API_KEY = 'x-jf-apikey';
  static HEADER_TOKEN = 'jfwt';
  version = null;
  functionRequirements = null;
  queryParams = {};
  body = Buffer.from([]);
  bodyType = _functionRequirementsBodyType.FunctionRequirementsBodyType.NONE;
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
  setVersion(version) {
    if (version <= 0) {
      throw new _jellyFassException.JellyFaasException('Version must be a positive int');
    }
    this.version = version;
    return this;
  }
  async lookupFunction(functionId) {
    if (!functionId) {
      throw new _jellyFassException.JellyFaasException('Invalid parameter: functionId must be a string');
    }
    const url = `${Client.LOOKUP_ENDPOINT}?id=${functionId}${this.version ? `&version=${this.version}` : ''}`;
    const headers = {
      [Client.HEADER_API_KEY]: this.config.getApiKey() ?? ''
    };
    try {
      const response = await this.httpClient.get(url, {
        headers
      });
      if (response.status == 404) {
        throw new _jellyFassException.JellyFaasException('Function does not exist.');
      }
      const data = response.data;
      this.functionDNS = data.dns;
      this.functionRequirements = new _functionRequirements.FunctionRequirements(data.requirements);
      this.functionRequirements.decodeSchemas();
      //this.functionRequirements.checkInputs();
      //this.functionRequirements.checkOutputs();
      //console.log(JSON.stringify( data, null, ' '))

      return this;
    } catch (error) {
      if (error instanceof Error) {
        throw new _jellyFassException.JellyFaasException(`Function lookup failed: ${error.message}`);
      } else {
        throw new _jellyFassException.JellyFaasException("Function lookup failed: Unknown error occurred");
      }
    }
  }
  setFunctionQueryParams(queryParams, doValidation = true) {
    if (doValidation) {
      this.validateQueryParams(queryParams);
    }
    this.queryParams = queryParams;
    return this;
  }
  setFunctionJsonBody(body) {
    if (this.functionRequirements?.getInputBodyType() !== "JSON") {
      throw new _jellyFassException.JellyFaasException('Function does not take JSON body.');
    }
    if (this.bodyType !== _functionRequirementsBodyType.FunctionRequirementsBodyType.NONE) {
      throw new _jellyFassException.JellyFaasException('Body already set.');
    }
    if (!body) {
      throw new _jellyFassException.JellyFaasException('Function requires a body');
    }
    const schema = this.functionRequirements.getInputSchema();
    this.validateSchema(body, schema);
    this.body = Buffer.from(JSON.stringify(body)); // Converts the JSON string to a byte array.
    this.bodyType = _functionRequirementsBodyType.FunctionRequirementsBodyType.JSON;
    return this;
  }
  async setFunctionFileBody(filePath) {
    // Validate the input body type to ensure it's a file
    if (this.functionRequirements?.getInputBodyType() !== "FILE") {
      throw new _jellyFassException.JellyFaasException('Function does not take File body.');
    }

    // Check if body is already set
    if (this.bodyType !== _functionRequirementsBodyType.FunctionRequirementsBodyType.NONE) {
      throw new _jellyFassException.JellyFaasException('Body already set.');
    }
    try {
      // Assuming FunctionRequirementsFile is an object that has an extensions property (Array of strings)
      const inputFile = this.functionRequirements?.inputSchema;
      if (!inputFile) {
        throw new _jellyFassException.JellyFaasException('No file requirement found.');
      }

      // Get the file name and extension from filePath
      const fileName = path.basename(filePath);
      const extension = path.extname(fileName).slice(1); // Extract file extension without the dot

      if (!extension) {
        throw new _jellyFassException.JellyFaasException('File has no extension.');
      }

      // Check if the file extension is valid
      if (!inputFile.extensions?.includes(extension)) {
        throw new _jellyFassException.JellyFaasException(`Invalid file type. Allowed types: ${inputFile.extensions?.join(', ')}`);
      }

      // Read the file content into a buffer
      const stats = await _fs.promises.stat(filePath); // Get file stats
      const buffer = Buffer.alloc(stats.size); // Allocate buffer for the file content

      // Read the file content into the buffer
      const fileHandle = await _fs.promises.open(filePath, 'r'); // Open the file for reading
      await fileHandle.read(buffer, 0, stats.size, 0); // Read the file content into the buffer
      await fileHandle.close(); // Close the file handle after reading

      // Set the body to the file content
      this.body = buffer;
      this.bodyType = _functionRequirementsBodyType.FunctionRequirementsBodyType.FILE;
      return this;
    } catch (error) {
      if (error instanceof Error) {
        throw new _jellyFassException.JellyFaasException(`Error processing file: ${error.message}`);
      } else {
        throw new _jellyFassException.JellyFaasException('Error processing file: Unknown error occurred.');
      }
    }
  }
  async invoke(outputType, doValidation = true, checkStatus = true) {
    try {
      // Validation logic
      if (doValidation) {
        if (this.functionRequirements?.inputType !== this.bodyType) {
          throw new _jellyFassException.JellyFaasException(`Invalid function body type. Expected ${this.functionRequirements?.inputType} but got ${this.bodyType}.\n` + `To ignore this error, call invoke() with doValidation set to false.`);
        }
        switch (this.functionRequirements?.outputType) {
          case null:
          case "NONE":
            if (outputType) {
              throw new _jellyFassException.JellyFaasException(`Invalid output type. Expected no output but got ${this.getTypeName(outputType)}.\n` + `To ignore this error, call invoke() with doValidation set to false.`);
            }
            break;
          case "JSON":
            if (!outputType) {
              throw new _jellyFassException.JellyFaasException(`Invalid output type. Expected JSON-serializable class but got ${this.getTypeName(outputType)}.\n` + `To ignore this error, call invoke() with doValidation set to false.`);
            }
            break;
          case "FILE":
            if (outputType !== Buffer) {
              throw new _jellyFassException.JellyFaasException(`Invalid output type. Expected Buffer but got ${this.getTypeName(outputType)}.\n` + `To ignore this error, call invoke() with doValidation set to false.`);
            }
            break;
          default:
            throw new _jellyFassException.JellyFaasException(`Unknown output type.` + `To ignore this error, call invoke() with doValidation set to false.`);
        }
      }

      // Building the URL
      const url = `${this.functionDNS}?${new URLSearchParams(this.queryParams).toString()}`;
      const headers = {
        [Client.HEADER_TOKEN]: this.config.getToken() ?? '',
        'Content-Type': 'application/json'
      };

      // Making the HTTP request
      const response = await this.httpClient.request({
        url,
        method: this.functionRequirements?.requestType,
        headers,
        data: this.body,
        responseType: 'arraybuffer'
      });
      this.response = response;
      // Status check
      if (checkStatus && !(response.status >= 200 && response.status < 300)) {
        throw new _jellyFassException.JellyFaasException(`HTTP error ${response.status}: ${response.statusText}\n` + `To ignore non-2xx status code errors, call invoke() with checkStatus set to false.`);
      }

      // Handle no output
      if (!outputType) {
        const jsonString = Buffer.from(response.data).toString('utf-8'); // Convert ArrayBuffer to string
        const jsonData = JSON.parse(jsonString); // Parse the JSON string
        return jsonData;
      }

      // Handle binary output
      if (outputType === Buffer) {
        return Buffer.from(response.data);
      }

      // Handle JSON output
      if (this.functionRequirements?.outputType === _functionRequirementsBodyType.FunctionRequirementsBodyType.JSON) {
        const jsonString = Buffer.from(response.data).toString('utf-8'); // Convert ArrayBuffer to string
        const jsonData = JSON.parse(jsonString); // Parse the JSON string

        return jsonData;
        // Use class-transformer to map the plain JSON to the class instance

        // const outputInstance = plainToInstance(outputType, jsonData, {
        //     excludeExtraneousValues: true, // This ensures that extra properties are not assigned
        //     enableImplicitConversion: true 
        // }) as T;

        // return outputInstance; // Return the populated instance
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new _jellyFassException.JellyFaasException(`Invocation failed: ${error.message}`);
      } else {
        throw new _jellyFassException.JellyFaasException("Invocation failed: Unknown error occurred");
      }
    }
  }
  getStatusCode() {
    return this.response?.status ?? 0;
  }
  validateQueryParams(params) {
    const schema = this.functionRequirements?.queryParams;
    if (!schema) {
      return;
    }
    schema.forEach(param => {
      if (param.required && !(param?.name in params)) {
        throw new _jellyFassException.JellyFaasException(`Missing required query parameter: ${param.name}`);
      }
    });
  }
  validateSchema(body, schema) {
    const ajv = new _.default();
    const validate = ajv.compile(schema);
    if (!validate(body)) {
      const errors = validate.errors?.map(err => `${err.instancePath} ${err.message}`).join(", ") || "Unknown validation error";
      throw new _jellyFassException.JellyFaasException(`Schema validation failed: ${errors}`);
    }
  }
  getTypeName(value) {
    if (value === null || value === undefined) {
      return 'null or undefined';
    }

    // If it's an object, check for `name` or `constructor`
    if (typeof value === 'object') {
      return value.name || value.constructor?.name || 'Object';
    }

    // For primitive types, return their type
    return typeof value;
  }
}
exports.Client = Client;
//# sourceMappingURL=client.js.map