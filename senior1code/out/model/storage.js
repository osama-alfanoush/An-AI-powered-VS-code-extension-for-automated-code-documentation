"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
class StorageService {
    constructor(context) {
        this.context = context;
    }
    /**
     * Get the full extension configuration
     */
    getConfig() {
        const defaultConfig = {
            defaultModelId: 'deepseek-v3', // Changed from defaultModel to defaultModelId
            apiUrl: 'http://localhost:8000',
            models: [
                {
                    id: 'deepseek-v3',
                    name: 'DeepSeek V3',
                    provider: 'huggingface',
                    description: 'DeepSeek V3 model from Hugging Face' // Added description
                }
            ],
            promptTemplates: [
                {
                    id: 'docs',
                    name: '[System] Documentation',
                    content: `Generate Google-style documentation for this code. Include:
1. Brief description of functionality
2. Args/Parameters section with types
3. Returns section with type and description
4. Raises/Exceptions section
5. Examples of usage
6. Any important notes`,
                    isSystem: true
                },
                {
                    id: 'bugs',
                    name: '[System] Bug Detection',
                    content: `Analyze for:
1. Syntax errors
2. Logical errors
3. Potential runtime issues
4. Suggested fixes
5. Optimization opportunities`,
                    isSystem: true
                },
                {
                    id: 'review',
                    name: '[System] Code Review',
                    content: `Review the code for:
1. Code quality assessment
2. Potential improvements
3. Best practices violations
4. Security concerns
5. Performance considerations`,
                    isSystem: true
                }
            ]
        };
        try {
            const storedConfig = this.context.globalState.get(StorageService.CONFIG_KEY);
            if (!storedConfig) {
                // If no config exists, store the default and return it
                this.saveConfig(defaultConfig);
                return defaultConfig;
            }
            // Merge with default config to ensure any new fields get default values
            return {
                ...defaultConfig,
                ...storedConfig,
                // Always ensure system prompt templates are present
                promptTemplates: [
                    ...defaultConfig.promptTemplates.filter((p) => p.isSystem),
                    ...storedConfig.promptTemplates.filter((p) => !p.isSystem)
                ]
            };
        }
        catch (error) {
            console.error('Failed to retrieve config:', error);
            return defaultConfig;
        }
    }
    /**
     * Save the extension configuration
     */
    saveConfig(config) {
        return this.context.globalState.update(StorageService.CONFIG_KEY, config);
    }
    /**
     * Get all prompt templates (system + user)
     */
    getPromptTemplates() {
        return this.getConfig().promptTemplates;
    }
    /**
     * Save a new prompt template
     */
    savePromptTemplate(template) {
        const config = this.getConfig();
        // Remove existing template with same ID if exists
        config.promptTemplates = config.promptTemplates.filter((t) => t.id !== template.id);
        // Add the new template
        config.promptTemplates.push(template);
        return this.saveConfig(config);
    }
    /**
     * Delete a prompt template
     */
    deletePromptTemplate(id) {
        const config = this.getConfig();
        // Don't delete system templates
        const templateToDelete = config.promptTemplates.find((t) => t.id === id);
        if (templateToDelete?.isSystem) {
            return Promise.reject('Cannot delete system templates');
        }
        config.promptTemplates = config.promptTemplates.filter((t) => t.id !== id);
        return this.saveConfig(config);
    }
    /**
     * Get the API base URL
     */
    getApiUrl() {
        return this.getConfig().apiUrl;
    }
    /**
     * Update the API base URL
     */
    setApiUrl(url) {
        const config = this.getConfig();
        config.apiUrl = url;
        return this.saveConfig(config);
    }
    /**
     * Set the default model
     */
    setDefaultModel(modelId) {
        const config = this.getConfig();
        config.defaultModelId = modelId; // Changed from defaultModel to defaultModelId
        return this.saveConfig(config);
    }
    /**
     * Get the default model
     */
    getDefaultModel() {
        const config = this.getConfig();
        return config.models.find(model => model.id === config.defaultModelId); // Changed from defaultModel to defaultModelId
    }
}
exports.StorageService = StorageService;
StorageService.CONFIG_KEY = 'aiExtension.config';
//# sourceMappingURL=storage.js.map