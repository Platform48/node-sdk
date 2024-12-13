export class JellyFaasFunction {
    public id: string | null = null;
    public version: number | null = null;
    
    constructor(id: string, version: number | null = null) {
        this.id = id;
        this.version = version;
    }
}