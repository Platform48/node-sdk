export class FunctionRequirementsQueryParam {
    public name: string | null = null;
    public required: boolean = false;
    public description: string | null = null;
    public exampleData: string | null = null;
  
    // Getters and setters
    public getName(): string | null {
      return this.name;
    }
  
    public setName(name: string): void {
      this.name = name;
    }
  
    public isRequired(): boolean {
      return this.required;
    }
  
    public setRequired(required: boolean): void {
      this.required = required;
    }
  
    public getDescription(): string | null {
      return this.description;
    }
  
    public setDescription(description: string): void {
      this.description = description;
    }
  
    public getExampleData(): string | null {
      return this.exampleData;
    }
  
    public setExampleData(exampleData: string): void {
      this.exampleData = exampleData;
    }
  }
