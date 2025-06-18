"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
/**
 * Service for AI model operations and communications
 */
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const api_1 = require("../../model/api");
const eventBus_1 = require("../events/eventBus");
const eventTypes_1 = require("../events/eventTypes");
const modelStrategy_1 = require("../strategies/modelStrategy");
class AIService {
    constructor(storageService, promptService) {
        this.isProcessing = false;
        this.storageService = storageService;
        this.promptService = promptService;
        this.eventBus = eventBus_1.EventBus.getInstance();
        // Initialize API client with URL from storage
        const apiUrl = this.storageService.getApiUrl();
        this.apiClient = new api_1.APIClient(apiUrl);
        // Set up event listeners
        this.setupEventListeners();
        // Initialize with the default model
        this.initializeDefaultModel();
    }
    /**
     * Set up event listeners for AI-related events
     */
    setupEventListeners() {
        this.eventBus.on(eventTypes_1.EventTypes.UI_GENERATE_DOCS_REQUESTED, async (event) => {
            const payload = event.payload;
            await this.generateDocumentation(payload.code, payload.promptId, payload.customPrompt);
        });
        this.eventBus.on(eventTypes_1.EventTypes.UI_ANALYZE_BUGS_REQUESTED, async (event) => {
            const payload = event.payload;
            await this.analyzeBugs(payload.code);
        });
        this.eventBus.on(eventTypes_1.EventTypes.UI_MODEL_SELECTED, (event) => {
            this.selectModelStrategy(event.payload);
        });
    }
    /**
     * Initialize the default model strategy
     */
    initializeDefaultModel() {
        const defaultModel = this.storageService.getDefaultModel();
        if (defaultModel) {
            this.selectModelStrategy(defaultModel.id);
        }
    }
    /**
     * Select a model strategy by ID
     */
    selectModelStrategy(modelId) {
        const config = this.storageService.getConfig();
        const model = config.models.find(m => m.id === modelId);
        if (!model) {
            this.eventBus.emit(eventTypes_1.EventTypes.STATUS_UPDATED, {
                message: `Model ${modelId} not found`,
                type: 'error'
            });
            return undefined;
        }
        this.currentStrategy = modelStrategy_1.ModelStrategyFactory.createStrategy(this.apiClient, model);
        return this.currentStrategy;
    }
    /**
     * Generate documentation for code
     */
    async generateDocumentation(code, promptId, customPrompt) {
        if (this.isProcessing) {
            this.eventBus.emit(eventTypes_1.EventTypes.STATUS_UPDATED, {
                message: 'Another operation is in progress',
                type: 'warning'
            });
            return;
        }
        this.isProcessing = true;
        try {
            // Notify processing started
            const editor = vscode.window.activeTextEditor;
            const fileName = editor ? path.basename(editor.document.fileName) : undefined;
            this.eventBus.emit(eventTypes_1.EventTypes.LOGIC_PROCESSING_STARTED, {
                operationType: 'documentation',
                fileName
            });
            // Ensure we have a model strategy
            if (!this.currentStrategy) {
                this.initializeDefaultModel();
                if (!this.currentStrategy) {
                    throw new Error('No model strategy available');
                }
            }
            // Format the prompt using the prompt service
            let formattedPrompt;
            if (promptId) {
                this.promptService.selectPromptStrategy(promptId);
                formattedPrompt = this.promptService.formatPrompt(code);
            }
            else if (customPrompt) {
                formattedPrompt = this.promptService.formatPrompt(code, customPrompt);
            }
            else {
                // Default to documentation template
                this.promptService.selectPromptStrategy('docs');
                formattedPrompt = this.promptService.formatPrompt(code);
            }
            // Call the AI model
            const response = await this.currentStrategy.generateDocumentation(code, formattedPrompt);
            // Handle the response
            if (response.status === 'success') {
                // Notify processing completed
                this.eventBus.emit(eventTypes_1.EventTypes.LOGIC_PROCESSING_COMPLETED, {
                    operationType: 'documentation',
                    result: response.content,
                    fileName
                });
                // If a file path was returned, open it
                if (response.filePath) {
                    try {
                        const docUri = vscode.Uri.file(response.filePath);
                        await vscode.window.showTextDocument(docUri);
                        this.eventBus.emit(eventTypes_1.EventTypes.STATUS_UPDATED, {
                            message: `Documentation saved to ${response.filePath}`,
                            type: 'success'
                        });
                    }
                    catch (fileError) {
                        console.error('Failed to open documentation file:', fileError);
                    }
                }
                else {
                    // Otherwise create a new file with the content
                    await this.saveDocumentation(editor?.document, response.content);
                }
            }
            else {
                throw new Error(response.errorMessage || 'Unknown error');
            }
        }
        catch (error) {
            // Notify processing failed
            this.eventBus.emit(eventTypes_1.EventTypes.LOGIC_PROCESSING_FAILED, {
                operationType: 'documentation',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            this.eventBus.emit(eventTypes_1.EventTypes.STATUS_UPDATED, {
                message: `Documentation generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                type: 'error'
            });
        }
        finally {
            this.isProcessing = false;
        }
    }
    /**
     * Analyze code for bugs
     */
    async analyzeBugs(code) {
        if (this.isProcessing) {
            this.eventBus.emit(eventTypes_1.EventTypes.STATUS_UPDATED, {
                message: 'Another operation is in progress',
                type: 'warning'
            });
            return;
        }
        this.isProcessing = true;
        try {
            // Notify processing started
            const editor = vscode.window.activeTextEditor;
            const fileName = editor ? path.basename(editor.document.fileName) : undefined;
            this.eventBus.emit(eventTypes_1.EventTypes.LOGIC_PROCESSING_STARTED, {
                operationType: 'analysis',
                fileName
            });
            // Ensure we have a model strategy
            if (!this.currentStrategy) {
                this.initializeDefaultModel();
                if (!this.currentStrategy) {
                    throw new Error('No model strategy available');
                }
            }
            // Call the AI model (the API will handle adding "Code:" prefix)
            const response = await this.currentStrategy.analyzeBugs(code);
            // Handle the response
            if (response.status === 'success') {
                // Notify processing completed
                this.eventBus.emit(eventTypes_1.EventTypes.LOGIC_PROCESSING_COMPLETED, {
                    operationType: 'analysis',
                    result: response.content,
                    fileName
                });
            }
            else {
                throw new Error(response.errorMessage || 'Unknown error');
            }
        }
        catch (error) {
            // Notify processing failed
            this.eventBus.emit(eventTypes_1.EventTypes.LOGIC_PROCESSING_FAILED, {
                operationType: 'analysis',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            this.eventBus.emit(eventTypes_1.EventTypes.STATUS_UPDATED, {
                message: `Code analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                type: 'error'
            });
        }
        finally {
            this.isProcessing = false;
        }
    }
    /**
     * Save documentation to a file
     */
    async saveDocumentation(doc, content) {
        try {
            let docPath;
            if (doc) {
                const baseName = path.basename(doc.fileName, path.extname(doc.fileName));
                docPath = path.join(path.dirname(doc.fileName), `${baseName}_doc.txt`);
            }
            else {
                // No active document, use a temp file in the workspace
                const workspaceFolders = vscode.workspace.workspaceFolders;
                if (workspaceFolders && workspaceFolders.length > 0) {
                    docPath = path.join(workspaceFolders[0].uri.fsPath, `documentation_${Date.now()}.txt`);
                }
                else {
                    throw new Error('No active document or workspace');
                }
            }
            const uri = vscode.Uri.file(docPath);
            await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
            await vscode.window.showTextDocument(uri);
            this.eventBus.emit(eventTypes_1.EventTypes.STATUS_UPDATED, {
                message: `Documentation saved to ${docPath}`,
                type: 'success'
            });
        }
        catch (error) {
            this.eventBus.emit(eventTypes_1.EventTypes.STATUS_UPDATED, {
                message: `Failed to save documentation: ${error instanceof Error ? error.message : 'Unknown error'}`,
                type: 'error'
            });
        }
    }
    /**
     * Update the API URL
     */
    updateApiUrl(url) {
        this.apiClient.setBaseUrl(url);
        this.storageService.setApiUrl(url);
    }
    /**
     * Check if the backend service is available
     */
    async checkBackendAvailability() {
        try {
            return await this.apiClient.healthCheck();
        }
        catch (error) {
            return false;
        }
    }
}
exports.AIService = AIService;
//# sourceMappingURL=aiService.js.map