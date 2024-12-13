export class JellyFaasException extends Error {
    constructor(message: string) {
      super(message); // Call the parent class constructor
      this.name = "JellyFaasException"; // Set the name explicitly
      Object.setPrototypeOf(this, JellyFaasException.prototype); // Maintain proper prototype chain
    }
  }
  