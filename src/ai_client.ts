import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { JellyFaasException } from './exceptions/jellyFassException'; // Import exceptions
import { JellyFaasFunction } from './structs/jellyFaasFunction';
import { AIConfig } from './ai_config';

enum QueryType {
    DIRECT,
    RAG,
    RDBMS,
    FUNCTION
}

export class AIClient {

    private static LOOKUP_ENDPOINT = 'https://api.jellyfaas.com/auth-service/v1/lookup'
    private static QUERY_SERVICE_ENDPOINT = 'https://ai.jellyfaas.com/query-service/v1'
    private static HEADER_API_KEY = "x-jf-apikey"
    private static HEADER_TOKEN = 'jfwt';


    private config: AIConfig;
    private httpClient: AxiosInstance;
    private queryType: QueryType = QueryType.DIRECT;
    
    // Function calling querying
    private functions: Array<JellyFaasFunction> = [];

    // Vector DB querying
    private vectorDatabaseName!: string;
    private vectorDatabaseConnectionString!: string;
    
    // RDBMS querying
    private rdbmsTables!: Array<string>
    private rmdbsConnectionString!: string

    constructor(config: AIConfig) {
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

    async connectVectorDatabase(databaseName: string, connectionString: string = ''){
        if (databaseName == '') {
            throw new JellyFaasException('Invalid database name')
        }
        
        this.vectorDatabaseName = databaseName
        if (connectionString != ''){
            this.vectorDatabaseConnectionString = connectionString
        }
        this.queryType = QueryType.RAG
        return this
    }

    async connectRelationalDatabase(connectionString:string, tables:Array<string>){
        if (connectionString == '') {
            throw new JellyFaasException('Invalid connection string')
        }
        if (!tables) {
            throw new JellyFaasException('Invalid tables')
        }
        
        this.rmdbsConnectionString = connectionString
        this.rdbmsTables = tables
        this.queryType = QueryType.RDBMS
        return this
    }

    async lookupFunction(jellyFaasFunction: JellyFaasFunction): Promise<AIClient> {
        if (!jellyFaasFunction || typeof jellyFaasFunction !== 'object') {
            throw new JellyFaasException('Expected function object');
        }

        const functionId = jellyFaasFunction.id;
        if (!functionId) {
            throw new JellyFaasException('Expected function id');
        }

        const queryParams: Record<string, unknown> = { id: functionId };

        const functionVersion = jellyFaasFunction.version;
        if (functionVersion !== null && functionVersion !== undefined) {
            queryParams['version'] = functionVersion;
        }

        this.debug(`Starting lookupFunction method with functionId=${functionId}`);

        try {
            const lookupResponse: AxiosResponse = await this.httpClient.get(
                AIClient.LOOKUP_ENDPOINT,
                {
                    headers: { [AIClient.HEADER_API_KEY]: this.config.getApiKey() ?? ''},
                    params: queryParams,
                }
            );

            this.debug(`Received response: ${lookupResponse.status}`);
            if (lookupResponse.status < 200 || lookupResponse.status >= 300) {
                throw new JellyFaasException(`HTTP error: ${lookupResponse.status}`);
            }

            const functionDetails = {
                id: functionId,
                version: functionVersion,
                dns: lookupResponse.data.dns || null,
                requirements: lookupResponse.data.requirements || null,
            };

            this.functions.push(functionDetails);
            this.debug('Successfully looked up function');

            this.queryType = QueryType.FUNCTION
            return this;
        } catch (error: unknown) {
            if (error instanceof Error) {
                // Now TypeScript knows `error` is an instance of `Error`
                const errorMessage = (error as { isAxiosError?: boolean; message: string }).isAxiosError
                    ? `HTTP error occurred: ${error.message}`
                    : `Other error occurred: ${error.message}`;
                
                console.error(errorMessage);
                throw new JellyFaasException(errorMessage);
            } else {
                // Handle case where the error is not an instance of Error (e.g., if it's a string or other type)
                console.error('An unknown error occurred.');
                throw new JellyFaasException('An unknown error occurred.');
            }
        }
    }

    async query(query: string, ragQuery: string = ""): Promise<unknown> {
        
        switch (this.queryType) {
            case QueryType.DIRECT:
                return await this.directQuery(query)
            case QueryType.RAG:
                return await this.ragQuery(query, ragQuery)
            case QueryType.RDBMS:
                return await this.rdbmsQuery(query)
            case QueryType.FUNCTION:
                return await this.functionQuery(query);
        }
    }

    private async rdbmsQuery(query: string) {
        try {
            const response: AxiosResponse = await this.httpClient.post(
                AIClient.QUERY_SERVICE_ENDPOINT+"/rdbms",
                {
                    "query": query,
                    "mysql_connection_string": this.rmdbsConnectionString,
                    "tables":this.rdbmsTables
                },
                {
                    headers: { [AIClient.HEADER_TOKEN]: this.config.getToken() ?? '' },

                }
            )
            return response.data;
        } catch (error: unknown) {
            if (error instanceof Error) {
                // Now TypeScript knows `error` is an instance of `Error`
                const errorMessage = (error as { isAxiosError?: boolean; message: string }).isAxiosError
                    ? `HTTP error occurred: ${error.message}`
                    : `Other error occurred: ${error.message}`;
                
                console.error(errorMessage);
                throw new JellyFaasException(errorMessage);
            } else {
                // Handle case where the error is not an instance of Error (e.g., if it's a string or other type)
                console.error('An unknown error occurred.');
                throw new JellyFaasException('An unknown error occurred.');
            }
        }
    }

    private async directQuery(query: string) {
        try {
            const response: AxiosResponse = await this.httpClient.post(
                AIClient.QUERY_SERVICE_ENDPOINT+"/query",
                {
                    "query": query
                },
                {
                    headers: { [AIClient.HEADER_TOKEN]: this.config.getToken() ?? '' },

                }
            )
            return response.data;
        } catch (error: unknown) {
            if (error instanceof Error) {
                // Now TypeScript knows `error` is an instance of `Error`
                const errorMessage = (error as { isAxiosError?: boolean; message: string }).isAxiosError
                    ? `HTTP error occurred: ${error.message}`
                    : `Other error occurred: ${error.message}`;
                
                console.error(errorMessage);
                throw new JellyFaasException(errorMessage);
            } else {
                // Handle case where the error is not an instance of Error (e.g., if it's a string or other type)
                console.error('An unknown error occurred.');
                throw new JellyFaasException('An unknown error occurred.');
            }
        }
    }
    
    
    private async ragQuery(query: string, ragQuery: string = "") {
        try {

            let body: { 
                query: string; 
                rag_query?: string; 
                vector_mongo_collection: string; 
                vector_mongo_connection_string?: string 
            } = {
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

            const response: AxiosResponse = await this.httpClient.post(
                AIClient.QUERY_SERVICE_ENDPOINT+"/vectordb", body,
                {
                    headers: { [AIClient.HEADER_TOKEN]: this.config.getToken() ?? '' },

                }
            )
            return response.data;
        } catch (error: unknown) {
            if (error instanceof Error) {
                // Now TypeScript knows `error` is an instance of `Error`
                const errorMessage = (error as { isAxiosError?: boolean; message: string }).isAxiosError
                    ? `HTTP error occurred: ${error.message}`
                    : `Other error occurred: ${error.message}`;
                
                console.error(errorMessage);
                throw new JellyFaasException(errorMessage);
            } else {
                // Handle case where the error is not an instance of Error (e.g., if it's a string or other type)
                console.error('An unknown error occurred.');
                throw new JellyFaasException('An unknown error occurred.');
            }
        }
    }
        
    private async functionQuery(query: string) {
        try {
            const response: AxiosResponse = await this.httpClient.post(
                AIClient.QUERY_SERVICE_ENDPOINT+"/function",
                {
                    "query": query,
                    "function": this.functions[0].id,
                    "ai_platform": "gemini"
                },
                {
                    headers: { [AIClient.HEADER_TOKEN]: this.config.getToken() ?? ''},
                }
            )
            return response.data

        } catch (error: unknown) {
            if (error instanceof Error) {
                // Now TypeScript knows `error` is an instance of `Error`
                const errorMessage = (error as { isAxiosError?: boolean; message: string }).isAxiosError
                    ? `HTTP error occurred: ${error.message}`
                    : `Other error occurred: ${error.message}`;
                
                console.error(errorMessage);
                throw new JellyFaasException(errorMessage);
            } else {
                // Handle case where the error is not an instance of Error (e.g., if it's a string or other type)
                console.error('An unknown error occurred.');
                throw new JellyFaasException('An unknown error occurred.');
            }
        }
    }


    private debug(message: string): void {
        console.log(`[DEBUG] ${message}`);
    }
}
