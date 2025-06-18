"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIClient = void 0;
class APIClient {
    constructor(baseUrl = 'http://localhost:8000') {
        this.baseUrl = baseUrl;
    }
    /**
     * Set the API base URL
     */
    setBaseUrl(url) {
        this.baseUrl = url;
    }
    /**
     * Generate documentation for code
     */
    async generateDocs(request) {
        try {
            // Format the prompt to include the required "Code:" section
            const formattedPrompt = this.formatPrompt(request.promptTemplate, request.code);
            const response = await fetch(`${this.baseUrl}/generate-docs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: formattedPrompt
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to generate documentation');
            }
            const data = await response.json();
            return {
                content: data.result,
                status: 'success',
                filePath: data.file_path
            };
        }
        catch (error) {
            return {
                content: '',
                status: 'error',
                errorMessage: error instanceof Error ? error.message : 'Unknown error during documentation generation'
            };
        }
    }
    /**
     * Analyze code for bugs or improvements
     */
    async analyzeCode(request) {
        try {
            // Format the prompt to include the required "Code:" section
            const formattedPrompt = `Code: ${request.code}`;
            const response = await fetch(`${this.baseUrl}/analyze-bugs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: formattedPrompt
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to analyze code');
            }
            const data = await response.json();
            return {
                content: data.result,
                status: 'success'
            };
        }
        catch (error) {
            return {
                content: '',
                status: 'error',
                errorMessage: error instanceof Error ? error.message : 'Unknown error during code analysis'
            };
        }
    }
    /**
     * Health check to verify backend is running
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
            });
            return response.ok;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Format the prompt to ensure it includes the "Code:" section
     */
    formatPrompt(promptTemplate, code) {
        // If prompt already includes "Code:", don't add it again
        if (promptTemplate.includes('Code:')) {
            return promptTemplate;
        }
        // Otherwise format with the proper template
        return `${promptTemplate}\n\nCode:\n${code}`;
    }
}
exports.APIClient = APIClient;
//# sourceMappingURL=api.js.map