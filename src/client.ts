import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Ajv2020, { ValidateFunction } from 'ajv/dist/2020';

import { Config } from './config'; // Assuming the Config class is implemented
import { FunctionRequirements } from './structs/functionRequirements'; // Import necessary types
import { FunctionRequirementsBodyType } from './structs/functionRequirementsBodyType'
import { JellyFaasException } from './exceptions/jellyFassException'; // Import exceptions
import { promises as fsPromises } from 'fs';
import * as path from 'path';
import { ClassConstructor } from 'class-transformer';
import FunctionRequirementsFile from './structs/functionRequirementsFile';

export class Client {
    
    private static LOOKUP_ENDPOINT = 'https://api.jellyfaas.com/auth-service/v1/lookup';
    private static HEADER_API_KEY = 'x-jf-apikey';
    private static HEADER_TOKEN = 'jfwt';
    
    private config: Config;
    private httpClient: AxiosInstance;
    private version: number | null = null;
    private functionRequirements: FunctionRequirements | null = null;
    private functionDNS!: string;
    private queryParams: Record<string, string> = {};
    private body: Buffer = Buffer.from([]);
    private bodyType: FunctionRequirementsBodyType = FunctionRequirementsBodyType.NONE;
    private response!: AxiosResponse;

    constructor(config: Config) {
        if (!config || !config.getToken()) {
            throw new JellyFaasException('Config cannot be null');
        }
        this.config = config;
        this.httpClient = axios.create({
            validateStatus: function () {
                // Accept all HTTP statuses as "valid"
                // Axios won't throw for non-2xx statuses.
                return true;
            },
        });    
    }
    
    setVersion(version: number): Client {
        if (version <= 0) {
            throw new JellyFaasException('Version must be a positive int');
        }
        this.version = version;
        return this;
    }

    async lookupFunction(functionId: string): Promise<Client> {
        if (!functionId) {
            throw new JellyFaasException('Invalid parameter: functionId must be a string');
        }

        const url = `${Client.LOOKUP_ENDPOINT}?id=${functionId}${this.version ? `&version=${this.version}` : ''}`;
        const headers = {
            [Client.HEADER_API_KEY]: this.config.getApiKey() ?? '',
        };

        try {
            const response = await this.httpClient.get(url, { headers });
            
            if (response.status == 404) {
                throw new JellyFaasException('Function does not exist.');
            }


            const data = response.data;
            
            this.functionDNS = data.dns;
            this.functionRequirements = new FunctionRequirements(data.requirements);

            this.functionRequirements.decodeSchemas();
            //this.functionRequirements.checkInputs();
            //this.functionRequirements.checkOutputs();
            //console.log(JSON.stringify( data, null, ' '))

            return this;
        } catch (error) {
            if (error instanceof Error) {
                throw new JellyFaasException(`Function lookup failed: ${error.message}`);
            } else {
                throw new JellyFaasException("Function lookup failed: Unknown error occurred");
            }        
        }
    }

    setFunctionQueryParams(queryParams: Record<string, string>, doValidation = true): Client {
        if (doValidation) {
            this.validateQueryParams(queryParams);
        }
        this.queryParams = queryParams;
        return this;
    }

    setFunctionJsonBody(body: object): Client {
        if (this.functionRequirements?.getInputBodyType() !== "JSON") {
            throw new JellyFaasException('Function does not take JSON body.');
        }
        if (this.bodyType !== FunctionRequirementsBodyType.NONE) {
            throw new JellyFaasException('Body already set.');
        }
        if (!body) {
            throw new JellyFaasException('Function requires a body');
        }
        
        const schema = this.functionRequirements.getInputSchema();
        
        this.validateSchema(body, schema as Record<string, unknown>);
        
        this.body = Buffer.from(JSON.stringify(body)); // Converts the JSON string to a byte array.
        this.bodyType = FunctionRequirementsBodyType.JSON;
        return this;
    }

    async setFunctionFileBody(filePath: string): Promise<Client> {
        // Validate the input body type to ensure it's a file
        if (this.functionRequirements?.getInputBodyType() !== "FILE") {
            throw new JellyFaasException('Function does not take File body.');
        }

        // Check if body is already set
        if (this.bodyType !== FunctionRequirementsBodyType.NONE) {
            throw new JellyFaasException('Body already set.');
        }

        try {
            // Assuming FunctionRequirementsFile is an object that has an extensions property (Array of strings)
            const inputFile = this.functionRequirements?.inputSchema as FunctionRequirementsFile;
            if (!inputFile) {
                throw new JellyFaasException('No file requirement found.');
            }

            // Get the file name and extension from filePath
            const fileName = path.basename(filePath);
            const extension = path.extname(fileName).slice(1); // Extract file extension without the dot

            if (!extension) {
                throw new JellyFaasException('File has no extension.');
            }

            // Check if the file extension is valid
            if (!inputFile.extensions?.includes(extension)) {
                throw new JellyFaasException(`Invalid file type. Allowed types: ${inputFile.extensions?.join(', ')}`);
            }


            // Read the file content into a buffer
            const stats = await fsPromises.stat(filePath); // Get file stats
            const buffer = Buffer.alloc(stats.size); // Allocate buffer for the file content

            // Read the file content into the buffer
            const fileHandle = await fsPromises.open(filePath, 'r'); // Open the file for reading
            await fileHandle.read(buffer, 0, stats.size, 0); // Read the file content into the buffer
            await fileHandle.close(); // Close the file handle after reading

            // Set the body to the file content
            this.body = buffer;
            this.bodyType = FunctionRequirementsBodyType.FILE;

            return this;
        } catch (error) {
            if (error instanceof Error) {
                throw new JellyFaasException(`Error processing file: ${error.message}`);
            } else {
                throw new JellyFaasException('Error processing file: Unknown error occurred.');
            }
        }
    }

    
    async invoke<T>(outputType?: ClassConstructor<T>, doValidation = true, checkStatus = true): Promise<T | void> {
        try {
            // Validation logic
            if (doValidation) {
                if (this.functionRequirements?.inputType !== this.bodyType) {
                    throw new JellyFaasException(
                        `Invalid function body type. Expected ${this.functionRequirements?.inputType} but got ${this.bodyType}.\n` +
                        `To ignore this error, call invoke() with doValidation set to false.`
                    );
                }

                switch (this.functionRequirements?.outputType) {
                    case null:
                    case "NONE":
                        if (outputType) {
                            throw new JellyFaasException(
                                `Invalid output type. Expected no output but got ${this.getTypeName(outputType)}.\n` +
                                `To ignore this error, call invoke() with doValidation set to false.`
                            );
                        }
                    break;
                    case "JSON":
                        if (!outputType) {
                            throw new JellyFaasException(
                                `Invalid output type. Expected JSON-serializable class but got ${this.getTypeName(outputType)}.\n` +
                                `To ignore this error, call invoke() with doValidation set to false.`
                            );
                        }
                    break;
                    case "FILE":
                        if (outputType !== Buffer as unknown as ClassConstructor<Buffer>) {
                            throw new JellyFaasException(
                                `Invalid output type. Expected Buffer but got ${this.getTypeName(outputType)}.\n` +
                                `To ignore this error, call invoke() with doValidation set to false.`
                            );
                        }
                    break;
                    default:
                        throw new JellyFaasException(
                            `Unknown output type.` +
                            `To ignore this error, call invoke() with doValidation set to false.`
                        ); 
                }
            }
        
            // Building the URL
            const url = `${this.functionDNS}?${new URLSearchParams(this.queryParams).toString()}`;
            const headers = {
                [Client.HEADER_TOKEN]: this.config.getToken() ?? '',
                'Content-Type': 'application/json',
            };
               
            // Making the HTTP request
            const response = await this.httpClient.request({
                url,
                method: this.functionRequirements?.requestType as string,
                headers,
                data: this.body,
                responseType: 'arraybuffer',
            });
    
            this.response = response;
            // Status check
            if (checkStatus && !(response.status >= 200 && response.status < 300)) {
                throw new JellyFaasException(
                    `HTTP error ${response.status}: ${response.statusText}\n` +
                    `To ignore non-2xx status code errors, call invoke() with checkStatus set to false.`
                );
            }
            
            // Handle no output
            if (!outputType) {
                const jsonString = Buffer.from(response.data).toString('utf-8'); // Convert ArrayBuffer to string
                const jsonData = JSON.parse(jsonString); // Parse the JSON string
                return jsonData;
            }
            
            // Handle binary output
            if (outputType === (Buffer as unknown as T)) {                
                return Buffer.from(response.data) as T;
            }
            
            // Handle JSON output
            if (this.functionRequirements?.outputType === FunctionRequirementsBodyType.JSON) {
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
                throw new JellyFaasException(`Invocation failed: ${error.message}`);
            } else {
                throw new JellyFaasException("Invocation failed: Unknown error occurred");
            }
        }
    }
        
    getStatusCode(): number {
        return this.response?.status ?? 0;
    }

    private validateQueryParams(params: Record<string, string>): void {
        const schema = this.functionRequirements?.queryParams;
        if (!schema) {
            return;
        }
        schema.forEach((param) => {
            if (param.required && !(param?.name as string in params)) {
                throw new JellyFaasException(`Missing required query parameter: ${param.name}`);
            }
        });
    }

    private validateSchema(body: object, schema: Record<string, unknown>): void {
        const ajv = new Ajv2020();
        const validate: ValidateFunction = ajv.compile(schema);   
        if (!validate(body)) {
            const errors = validate.errors
                ?.map(err => `${err.instancePath} ${err.message}`)
                .join(", ") || "Unknown validation error";

            throw new JellyFaasException(`Schema validation failed: ${errors}`);
        }
    }
    
    private getTypeName(value: unknown): string {
        if (value === null || value === undefined) {
            return 'null or undefined';
        }
    
        // If it's an object, check for `name` or `constructor`
        if (typeof value === 'object') {
            return (value as { name?: string; constructor?: { name: string } }).name ||
                   (value as { constructor?: { name: string } }).constructor?.name ||
                   'Object';
        }
    
        // For primitive types, return their type
        return typeof value;
    }   
}