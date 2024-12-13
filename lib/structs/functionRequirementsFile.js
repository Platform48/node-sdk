"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
class FunctionRequirementsFile {
  description = null;
  extensions = null;
  required = false;

  // Getters and setters
  getDescription() {
    return this.description;
  }
  setDescription(description) {
    this.description = description;
  }
  getExtensions() {
    return this.extensions;
  }
  setExtensions(extensions) {
    this.extensions = extensions;
  }
  isRequired() {
    return this.required;
  }
  setRequired(required) {
    this.required = required;
  }
}
var _default = exports.default = FunctionRequirementsFile;
//# sourceMappingURL=functionRequirementsFile.js.map