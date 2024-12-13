class FunctionRequirementsFile {
  public description: string | null = null;
  public extensions: string[] | null = null;
  public required: boolean = false;
  
    // Getters and setters
    public getDescription(): string | null {
      return this.description;
    }
  
    public setDescription(description: string): void {
      this.description = description;
    }
  
    public getExtensions(): string[] | null {
      return this.extensions;
    }
  
    public setExtensions(extensions: string[]): void {
      this.extensions = extensions;
    }
  
    public isRequired(): boolean {
      return this.required;
    }
  
    public setRequired(required: boolean): void {
      this.required = required;
    }
  }
  
  export default FunctionRequirementsFile;
  