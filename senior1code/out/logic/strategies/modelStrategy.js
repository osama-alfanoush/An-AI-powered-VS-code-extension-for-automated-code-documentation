"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelStrategyFactory = exports.OpenAIModelStrategy = exports.DeepSeekModelStrategy = exports.BaseModelStrategy = void 0;
/**
 * Base model strategy that uses the standard API endpoints
 */
class BaseModelStrategy {
    constructor(apiClient, model) {
        this.apiClient = apiClient;
        this.model = model;
    }
    async generateDocumentation(code, prompt) {
        return this.apiClient.generateDocs({
            code,
            promptTemplate: prompt
        });
    }
    async analyzeBugs(code) {
        return this.apiClient.analyzeCode({
            code
        });
    }
    getModelName() {
        return this.model.name;
    }
    async checkAvailability() {
        return this.apiClient.healthCheck();
    }
}
exports.BaseModelStrategy = BaseModelStrategy;
/**
 * Model strategy for DeepSeek models with specialized prompt formatting
 */
class DeepSeekModelStrategy extends BaseModelStrategy {
    constructor(apiClient, model) {
        super(apiClient, model);
    }
    // Override to add DeepSeek-specific formatting if needed
    async generateDocumentation(code, prompt) {
        // Format prompt specifically for DeepSeek
        const formattedPrompt = this.formatPromptForDeepSeek(prompt);
        return super.generateDocumentation(code, formattedPrompt);
    }
    formatPromptForDeepSeek(prompt) {
        // Add any DeepSeek-specific formatting if needed
        return prompt;
    }
}
exports.DeepSeekModelStrategy = DeepSeekModelStrategy;
/**
 * Model strategy for OpenAI models
 */
class OpenAIModelStrategy extends BaseModelStrategy {
    constructor(apiClient, model) {
        super(apiClient, model);
    }
}
exports.OpenAIModelStrategy = OpenAIModelStrategy;
/**
 * Factory for creating model strategies
 */
class ModelStrategyFactory {
    /**
     * Create a strategy based on the model configuration
     */
    static createStrategy(apiClient, model) {
        if (model.provider === 'huggingface' && model.id.includes('deepseek')) {
            return new DeepSeekModelStrategy(apiClient, model);
        }
        else if (model.provider === 'openai') {
            return new OpenAIModelStrategy(apiClient, model);
        }
        else {
            return new BaseModelStrategy(apiClient, model);
        }
    }
}
exports.ModelStrategyFactory = ModelStrategyFactory;
//# sourceMappingURL=modelStrategy.js.map