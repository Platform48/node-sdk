import { JellyFaasFunction } from './structs/jellyFaasFunction';
import { AIConfig } from './ai_config';
export declare class AIClient {
    private static LOOKUP_ENDPOINT;
    private static QUERY_SERVICE_ENDPOINT;
    private static HEADER_API_KEY;
    private static HEADER_TOKEN;
    private config;
    private httpClient;
    private queryType;
    private functions;
    private vectorDatabaseName;
    private vectorDatabaseConnectionString;
    private rdbmsTables;
    private rmdbsConnectionString;
    constructor(config: AIConfig);
    connectVectorDatabase(databaseName: string, connectionString?: string): Promise<this>;
    connectRelationalDatabase(connectionString: string, tables: Array<string>): Promise<this>;
    lookupFunction(jellyFaasFunction: JellyFaasFunction): Promise<AIClient>;
    query(query: string, ragQuery?: string): Promise<unknown>;
    private rdbmsQuery;
    private directQuery;
    private ragQuery;
    private functionQuery;
    private debug;
}
