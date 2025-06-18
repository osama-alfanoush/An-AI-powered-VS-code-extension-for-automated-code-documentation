"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocGeneratorService = void 0;
class DocGeneratorService {
    constructor(_modelStrategy) {
        this._modelStrategy = _modelStrategy;
    }
    async generateDocumentation(prompt, code) {
        const fullPrompt = `${prompt}\n\nCode:\n\`\`\`\n${code}\n\`\`\``;
        return this._modelStrategy.generate(fullPrompt);
    }
}
exports.DocGeneratorService = DocGeneratorService;
//# sourceMappingURL=DocGeneratorService.js.map