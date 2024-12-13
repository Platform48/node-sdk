import FunctionRequirementsFile from './functionRequirementsFile';
import { FunctionRequirementsQueryParam } from './functionRequirementsQueryParam';
import FunctionRequirementsJsonSchema from './functionRequirementsJsonSchema';


export class FunctionRequirements {
  public requestType: string | null = null;
  public description: string | null = null;

  public queryParams: FunctionRequirementsQueryParam[] | null = null;

  // public inputJsonSchemaEncoded: string | null = null;
  // public inputJsonSchema: Record<string, any> | null = null;
  // public inputJsonExample: string | null = null;
  // public inputFile: FunctionRequirementsFile | null = null;
  // public inputType: string | null = null;

  // public outputJsonSchemaEncoded: string | null = null;
  // public outputJsonSchema: Record<string, any> | null = null;
  // public outputJsonExample: string | null = null;
  // public outputFile: FunctionRequirementsFile | null = null;
  // public outputType: string | null= null;

  public inputType: string | null = null;
  public inputSchema: null | FunctionRequirementsJsonSchema | FunctionRequirementsFile = null;
  public inputSchemaEncoded: string | null = null;


  public outputType: string | null = null;
  public outputSchema: null | FunctionRequirementsJsonSchema | FunctionRequirementsFile = null;
  public outputSchemaEncoded: string | null = null;

  constructor(data: Partial<FunctionRequirements>) {
    Object.assign(this, data);
  }


  // Getters and setters
  public getRequestType(): string | null {
    return this.requestType;
  }

  public getDescription(): string | null {
    return this.description;
  }

  public getQueryParams(): FunctionRequirementsQueryParam[] | null {
    return this.queryParams;
  }

  public getInputType(): string | null {
    return this.inputType
  }

  public getOutputType(): string | null {
    return this.outputType
  }

  public getInputSchema(): object | null {
    return this.inputSchema
  }

  public getOutputSchema(): object | null {
    return this.outputSchema
  }

  // public getInputJsonSchemaEncoded(): string | null {
  //   return this.inputJsonSchemaEncoded;
  // }

  // public setInputJsonSchemaEncoded(encoded: string): void {
  //   this.inputJsonSchemaEncoded = encoded;
  // }

  // public getInputFile(): FunctionRequirementsFile | null {
  //   return this.inputFile;
  // }

  // public setInputFile(file: FunctionRequirementsFile): void {
  //   this.inputFile = file;
  // }

  // public getInputJsonSchema(): Record<string, any> | null {
  //   return this.inputJsonSchema;
  // }

  // public setInputJsonSchema(schema: Record<string, any>): void {
  //   this.inputJsonSchema = schema;
  // }

  // public getOutputJsonSchemaEncoded(): string | null {
  //   return this.outputJsonSchemaEncoded;
  // }

  // public setOutputJsonSchemaEncoded(encoded: string): void {
  //   this.outputJsonSchemaEncoded = encoded;
  // }

  // public getOutputFile(): FunctionRequirementsFile | null {
  //   return this.outputFile;
  // }

  // public setOutputFile(file: FunctionRequirementsFile): void {
  //   this.outputFile = file;
  // }

  // public getOutputJsonSchema(): Record<string, any> | null {
  //   return this.outputJsonSchema;
  // }

  // public setOutputJsonSchema(schema: Record<string, any>): void {
  //   this.outputJsonSchema = schema;
  // }

  // public getInputJsonExample(): string | null {
  //   return this.inputJsonExample;
  // }

  // public setInputJsonExample(example: string): void {
  //   this.inputJsonExample = example;
  // }

  // public getOutputJsonExample(): string | null {
  //   return this.outputJsonExample;
  // }

  // public setOutputJsonExample(example: string): void {
  //   this.outputJsonExample = example;
  // }

  // public getFunctionCallingEncoded(): string | null {
  //   return this.functionCallingEncoded;
  // }

  public getInputBodyType(): string | null {
    return this.inputType;
  }

  
  // Methods to decode JSON schemas
  public decodeSchemas(): void {
    try {
      if (this.inputSchemaEncoded) {
        const inputDecoded = atob(this.inputSchemaEncoded); // Decode Base64
        this.inputSchema = JSON.parse(inputDecoded); // Parse JSON directly
      }
      if (this.outputSchemaEncoded) {
        const outputDecoded = atob(this.outputSchemaEncoded); // Decode Base64
        this.outputSchema = JSON.parse(outputDecoded); // Parse JSON directly
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Failed to decode function requirements from server: " + error.message);
      } else {
        throw new Error("Failed to decode function requirements from server: Unknown error occurred");
      }    
    }
  }
  

  // // Methods to check input exclusivity
  // public checkInputs(): void {
  //   if (this.inputJsonSchema && this.inputFile) {
  //     throw new Error("Only one of 'input_json_schema' or 'input_file' can be set.");
  //   }
  //   if (this.inputJsonSchema) {
  //     this.inputType = FunctionRequirementsBodyType.JSON;
  //   } else if (this.inputFile) {
  //     this.inputType = FunctionRequirementsBodyType.FILE;
  //   } else {
  //     this.inputType = FunctionRequirementsBodyType.NONE;
  //   }
  // }

  // // Methods to check output exclusivity
  // public checkOutputs(): void {
  //   if (this.outputJsonSchema && this.outputFile) {
  //     throw new Error("Only one of 'output_json_schema' or 'output_file' can be set.");
  //   }
  //   if (this.outputJsonSchema) {
  //     this.outputType = FunctionRequirementsBodyType.JSON;
  //   } else if (this.outputFile) {
  //     this.outputType = FunctionRequirementsBodyType.FILE;
  //   } else {
  //     this.outputType = FunctionRequirementsBodyType.NONE;
  //   }
  // }
}
