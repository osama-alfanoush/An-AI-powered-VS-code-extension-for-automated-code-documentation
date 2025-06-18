"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptStrategyFactory = exports.DocumentationPromptStrategy = exports.CustomPromptStrategy = exports.DefaultPromptStrategy = void 0;
/**
 * Default prompt strategy
 */
class DefaultPromptStrategy {
    constructor(template) {
        this.template = template;
    }
    formatPrompt(code) {
        // Ensure we have the "Code:" section in the prompt
        const content = this.template.content;
        if (content.includes('Code:')) {
            // If the template already has a Code: section, replace it with the actual code
            const parts = content.split('Code:');
            return `${parts[0].trim()}\n\nCode:\n${code}`;
        }
        else {
            // Otherwise append Code: section
            return `${content.trim()}\n\nCode:\n${code}`;
        }
    }
    getName() {
        return this.template.name;
    }
}
exports.DefaultPromptStrategy = DefaultPromptStrategy;
/**
 * Custom prompt strategy for one-time use
 */
class CustomPromptStrategy {
    constructor(prompt) {
        this.prompt = prompt;
    }
    formatPrompt(code) {
        // Ensure we have the "Code:" section in the prompt
        if (this.prompt.includes('Code:')) {
            // If the prompt already has a Code: section, replace it with the actual code
            const parts = this.prompt.split('Code:');
            return `${parts[0].trim()}\n\nCode:\n${code}`;
        }
        else {
            // Otherwise append Code: section
            return `${this.prompt.trim()}\n\nCode:\n${code}`;
        }
    }
    getName() {
        return 'Custom Prompt';
    }
}
exports.CustomPromptStrategy = CustomPromptStrategy;
/**
 * Documentation prompt strategy
 */
class DocumentationPromptStrategy {
    constructor(template) {
        this.template = template;
    }
    formatPrompt(code) {
        return `${this.template.content.trim()}\n\nCode:\n${code}`;
    }
    getName() {
        return this.template.name;
    }
}
exports.DocumentationPromptStrategy = DocumentationPromptStrategy;
/**
 * Factory for creating prompt strategies
 */
class PromptStrategyFactory {
    /**
     * Create a strategy based on a template ID and available templates
     */
    static createStrategy(templateId, templates) {
        const template = templates.find(t => t.id === templateId);
        if (!template) {
            return undefined;
        }
        // Special handling for documentation prompts
        if (template.id === 'docs' || template.name.toLowerCase().includes('documentation')) {
            return new DocumentationPromptStrategy(template);
        }
        return new DefaultPromptStrategy(template);
    }
    /**
     * Create a custom prompt strategy from a prompt string
     */
    static createCustomStrategy(prompt) {
        return new CustomPromptStrategy(prompt);
    }
}
exports.PromptStrategyFactory = PromptStrategyFactory;
//# sourceMappingURL=promptStrategy.js.map