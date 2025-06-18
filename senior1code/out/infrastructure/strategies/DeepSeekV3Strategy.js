"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepSeekV3Strategy = void 0;
const inference_1 = require("@huggingface/inference");
class DeepSeekV3Strategy {
    constructor(_apiKey) {
        this._apiKey = _apiKey;
        this._hf = new inference_1.HfInference(_apiKey);
    }
    async generate(prompt) {
        const response = await this._hf.textGeneration({
            model: "deepseek-ai/deepseek-coder-33b-instruct",
            inputs: prompt,
            parameters: {
                max_new_tokens: 200,
                temperature: 0.3
            }
        });
        return response.generated_text;
    }
}
exports.DeepSeekV3Strategy = DeepSeekV3Strategy;
//# sourceMappingURL=DeepSeekV3Strategy.js.map