import { Config } from './config';
import { ClassConstructor } from 'class-transformer';
export declare class Client {
    private static LOOKUP_ENDPOINT;
    private static HEADER_API_KEY;
    private static HEADER_TOKEN;
    private config;
    private httpClient;
    private version;
    private functionRequirements;
    private functionDNS;
    private queryParams;
    private body;
    private bodyType;
    private response;
    constructor(config: Config);
    setVersion(version: number): Client;
    lookupFunction(functionId: string): Promise<Client>;
    setFunctionQueryParams(queryParams: Record<string, string>, doValidation?: boolean): Client;
    setFunctionJsonBody(body: object): Client;
    setFunctionFileBody(filePath: string): Promise<Client>;
    invoke<T>(outputType?: ClassConstructor<T>, doValidation?: boolean, checkStatus?: boolean): Promise<T | void>;
    getStatusCode(): number;
    private validateQueryParams;
    private validateSchema;
    private getTypeName;
}
