"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocsGenerationEventEmitter = void 0;
const vscode_1 = require("vscode");
class DocsGenerationEventEmitter {
    constructor() {
        this._onStart = new vscode_1.EventEmitter();
        this._onSuccess = new vscode_1.EventEmitter();
        this._onError = new vscode_1.EventEmitter();
        this.onGenerationStart = this._onStart.event;
        this.onGenerationSuccess = this._onSuccess.event;
        this.onGenerationError = this._onError.event;
    }
    emitStart() { this._onStart.fire(); }
    emitSuccess(content) { this._onSuccess.fire(content); }
    emitError(error) { this._onError.fire(error); }
}
exports.DocsGenerationEventEmitter = DocsGenerationEventEmitter;
//# sourceMappingURL=DocsGenerationEvents.js.map