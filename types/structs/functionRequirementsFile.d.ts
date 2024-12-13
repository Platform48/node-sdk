declare class FunctionRequirementsFile {
    description: string | null;
    extensions: string[] | null;
    required: boolean;
    getDescription(): string | null;
    setDescription(description: string): void;
    getExtensions(): string[] | null;
    setExtensions(extensions: string[]): void;
    isRequired(): boolean;
    setRequired(required: boolean): void;
}
export default FunctionRequirementsFile;
