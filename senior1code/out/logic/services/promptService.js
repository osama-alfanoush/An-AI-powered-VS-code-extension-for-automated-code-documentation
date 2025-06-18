"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptService = void 0;
/**
 * Service for managing and processing prompts
 */
const uuid_1 = require("uuid");
const eventBus_1 = require("../events/eventBus");
const eventTypes_1 = require("../events/eventTypes");
const promptStrategy_1 = require("../strategies/promptStrategy");
class PromptService {
    constructor(storageService) {
        this.storageService = storageService;
        this.eventBus = eventBus_1.EventBus.getInstance();
        // Set up event listeners
        this.setupEventListeners();
    }
    /**
     * Set up event listeners for prompt-related events
     */
    setupEventListeners() {
        this.eventBus.on(eventTypes_1.EventTypes.UI_SAVE_PROMPT_REQUESTED, (event) => {
            const { name, content } = event.payload;
            this.savePrompt(name, content);
        });
        this.eventBus.on(eventTypes_1.EventTypes.UI_DELETE_PROMPT_REQUESTED, (event) => {
            const { id } = event.payload;
            this.deletePrompt(id);
        });
        this.eventBus.on(eventTypes_1.EventTypes.UI_PROMPT_SELECTED, (event) => {
            this.selectPromptStrategy(event.payload);
        });
    }
    /**
     * Get all available prompt templates
     */
    getPromptTemplates() {
        return this.storageService.getPromptTemplates();
    }
    /**
     * Save a new prompt template
     */
    async savePrompt(name, content) {
        try {
            // Create a new template with a unique ID
            const template = {
                id: (0, uuid_1.v4)(),
                name,
                content,
                isSystem: false
            };
            await this.storageService.savePromptTemplate(template);
            // Notify that prompt was saved
            this.eventBus.emit(eventTypes_1.EventTypes.LOGIC_PROMPT_SAVED, template);
            this.eventBus.emit(eventTypes_1.EventTypes.STATUS_UPDATED, {
                message: `Prompt "${name}" saved successfully`,
                type: 'success'
            });
        }
        catch (error) {
            this.eventBus.emit(eventTypes_1.EventTypes.STATUS_UPDATED, {
                message: `Failed to save prompt: ${error instanceof Error ? error.message : 'Unknown error'}`,
                type: 'error'
            });
        }
    }
    /**
     * Delete a prompt template
     */
    async deletePrompt(id) {
        try {
            await this.storageService.deletePromptTemplate(id);
            // Notify that prompt was deleted
            this.eventBus.emit(eventTypes_1.EventTypes.LOGIC_PROMPT_DELETED, { id });
            this.eventBus.emit(eventTypes_1.EventTypes.STATUS_UPDATED, {
                message: 'Prompt deleted successfully',
                type: 'info'
            });
        }
        catch (error) {
            this.eventBus.emit(eventTypes_1.EventTypes.STATUS_UPDATED, {
                message: `Failed to delete prompt: ${error instanceof Error ? error.message : 'Unknown error'}`,
                type: 'error'
            });
        }
    }
    /**
     * Select a prompt strategy by template ID
     */
    selectPromptStrategy(templateId) {
        const templates = this.getPromptTemplates();
        this.currentStrategy = promptStrategy_1.PromptStrategyFactory.createStrategy(templateId, templates);
        return this.currentStrategy;
    }
    /**
     * Create a custom prompt strategy from a prompt string
     */
    createCustomStrategy(prompt) {
        this.currentStrategy = promptStrategy_1.PromptStrategyFactory.createCustomStrategy(prompt);
        return this.currentStrategy;
    }
    /**
     * Get the current prompt strategy
     */
    getCurrentStrategy() {
        return this.currentStrategy;
    }
    /**
     * Format code with the current strategy
     */
    formatPrompt(code, customPrompt) {
        // If custom prompt is provided, use a custom strategy
        if (customPrompt) {
            return this.createCustomStrategy(customPrompt).formatPrompt(code);
        }
        // Otherwise use the current strategy or default to a basic format
        if (this.currentStrategy) {
            return this.currentStrategy.formatPrompt(code);
        }
        // Fallback if no strategy is selected
        return `Code:\n${code}`;
    }
}
exports.PromptService = PromptService;
//# sourceMappingURL=promptService.js.map