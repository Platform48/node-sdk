import FunctionRequirementsFile from './functionRequirementsFile';
import { FunctionRequirementsQueryParam } from './functionRequirementsQueryParam';
import FunctionRequirementsJsonSchema from './functionRequirementsJsonSchema';
export declare class FunctionRequirements {
    requestType: string | null;
    description: string | null;
    queryParams: FunctionRequirementsQueryParam[] | null;
    inputType: string | null;
    inputSchema: null | FunctionRequirementsJsonSchema | FunctionRequirementsFile;
    inputSchemaEncoded: string | null;
    outputType: string | null;
    outputSchema: null | FunctionRequirementsJsonSchema | FunctionRequirementsFile;
    outputSchemaEncoded: string | null;
    constructor(data: Partial<FunctionRequirements>);
    getRequestType(): string | null;
    getDescription(): string | null;
    getQueryParams(): FunctionRequirementsQueryParam[] | null;
    getInputType(): string | null;
    getOutputType(): string | null;
    getInputSchema(): object | null;
    getOutputSchema(): object | null;
    getInputBodyType(): string | null;
    decodeSchemas(): void;
}
