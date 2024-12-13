"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FunctionRequirementsQueryParam = void 0;
class FunctionRequirementsQueryParam {
  name = null;
  required = false;
  description = null;
  exampleData = null;

  // Getters and setters
  getName() {
    return this.name;
  }
  setName(name) {
    this.name = name;
  }
  isRequired() {
    return this.required;
  }
  setRequired(required) {
    this.required = required;
  }
  getDescription() {
    return this.description;
  }
  setDescription(description) {
    this.description = description;
  }
  getExampleData() {
    return this.exampleData;
  }
  setExampleData(exampleData) {
    this.exampleData = exampleData;
  }
}
exports.FunctionRequirementsQueryParam = FunctionRequirementsQueryParam;
//# sourceMappingURL=functionRequirementsQueryParam.js.map