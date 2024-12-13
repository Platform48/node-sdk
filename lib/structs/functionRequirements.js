"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FunctionRequirements = void 0;
class FunctionRequirements {
  requestType = null;
  description = null;
  queryParams = null;

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

  inputType = null;
  inputSchema = null;
  inputSchemaEncoded = null;
  outputType = null;
  outputSchema = null;
  outputSchemaEncoded = null;
  constructor(data) {
    Object.assign(this, data);
  }

  // Getters and setters
  getRequestType() {
    return this.requestType;
  }
  getDescription() {
    return this.description;
  }
  getQueryParams() {
    return this.queryParams;
  }
  getInputType() {
    return this.inputType;
  }
  getOutputType() {
    return this.outputType;
  }
  getInputSchema() {
    return this.inputSchema;
  }
  getOutputSchema() {
    return this.outputSchema;
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

  getInputBodyType() {
    return this.inputType;
  }

  // Methods to decode JSON schemas
  decodeSchemas() {
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
exports.FunctionRequirements = FunctionRequirements;
//# sourceMappingURL=functionRequirements.js.map