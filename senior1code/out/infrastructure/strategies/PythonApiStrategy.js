"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonApiStrategy = void 0;
const axios_1 = __importDefault(require("axios"));
class PythonApiStrategy {
    constructor(_eventEmitter, _apiUrl = "http://localhost:8000") {
        this._eventEmitter = _eventEmitter;
        this._apiUrl = _apiUrl;
    }
    async generate(prompt) {
        try {
            this._eventEmitter.emitStart();
            const response = await axios_1.default.post(`${this._apiUrl}/generate-docs`, { prompt }, { timeout: 10000 });
            if (response.status !== 200) {
                throw new Error(`API error: ${response.statusText}`);
            }
            this._eventEmitter.emitSuccess(response.data.result);
        }
        catch (error) {
            this._eventEmitter.emitError(error instanceof Error ? error.message : "Unknown API error");
        }
    }
}
exports.PythonApiStrategy = PythonApiStrategy;
//# sourceMappingURL=PythonApiStrategy.js.map