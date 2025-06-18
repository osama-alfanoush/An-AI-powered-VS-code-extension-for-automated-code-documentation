"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocValidator = void 0;
class DocValidator {
    static validate(docstring) {
        const errors = [];
        const requiredSections = ["Args:", "Returns:", "Examples:"];
        requiredSections.forEach(section => {
            if (!docstring.includes(section)) {
                errors.push(`Missing ${section.replace(":", "")} section`);
            }
        });
        if (!docstring.includes('"""')) {
            errors.push("Docstring must be enclosed in triple quotes");
        }
        return errors;
    }
}
exports.DocValidator = DocValidator;
//# sourceMappingURL=DocValidator.js.map