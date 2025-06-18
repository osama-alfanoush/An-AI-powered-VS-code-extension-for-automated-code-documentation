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
exports.SidebarPanel = void 0;
/**
 * Sidebar panel webview provider implementation
 */
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const webviewContent_1 = require("./webviewContent");
const eventBus_1 = require("../../logic/events/eventBus");
const eventTypes_1 = require("../../logic/events/eventTypes");
class SidebarPanel {
    constructor(extensionUri) {
        this._prompts = [];
        this._currentFileName = 'None';
        this._extensionUri = extensionUri;
        this._eventBus = eventBus_1.EventBus.getInstance();
        // Set up event listeners
        this.setupEventListeners();
    }
    /**
     * Set up event listeners for sidebar updates
     */
    setupEventListeners() {
        // Listen to events that should update the webview
        this._eventBus.on(eventTypes_1.EventTypes.LOGIC_PROCESSING_STARTED, (event) => {
            const payload = event.payload;
            this.notifyProcessingStarted(payload);
        });
        this._eventBus.on(eventTypes_1.EventTypes.LOGIC_PROCESSING_COMPLETED, (event) => {
            const payload = event.payload;
            this.notifyProcessingCompleted(payload);
        });
        this._eventBus.on(eventTypes_1.EventTypes.LOGIC_PROCESSING_FAILED, (event) => {
            const payload = event.payload;
            this.notifyProcessingFailed(payload);
        });
        this._eventBus.on(eventTypes_1.EventTypes.STATUS_UPDATED, (event) => {
            const payload = event.payload;
            this.showMessage(payload.message, payload.type);
        });
        this._eventBus.on(eventTypes_1.EventTypes.FILE_STATUS_UPDATED, (event) => {
            const payload = event.payload;
            this.updateFileStatus(payload.fileName);
        });
        this._eventBus.on(eventTypes_1.EventTypes.LOGIC_PROMPT_SAVED, () => {
            this.updatePromptsList();
        });
        this._eventBus.on(eventTypes_1.EventTypes.LOGIC_PROMPT_DELETED, () => {
            this.updatePromptsList();
        });
    }
    /**
     * Called by VS Code when the webview is created or becomes visible
     */
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        // Allow scripts in the webview
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        // Set the webview's initial HTML content
        webviewView.webview.html = (0, webviewContent_1.getWebviewContent)(webviewView.webview, this._extensionUri, this._prompts, this._currentFileName);
        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(message => {
            this.handleWebviewMessage(message);
        });
        // Update the file status when the view is shown
        this.updateActiveFileStatus();
    }
    /**
     * Handle messages from the webview
     */
    handleWebviewMessage(message) {
        switch (message.command) {
            case 'webviewReady':
                // The webview is ready, so send any initial data
                this.updatePromptsList();
                this.updateActiveFileStatus();
                break;
            case 'generateDocs':
                this._eventBus.emit(eventTypes_1.EventTypes.UI_GENERATE_DOCS_REQUESTED, {
                    code: this.getActiveEditorCode(),
                    promptId: message.promptId,
                    customPrompt: message.customPrompt
                });
                break;
            case 'analyzeBugs':
                this._eventBus.emit(eventTypes_1.EventTypes.UI_ANALYZE_BUGS_REQUESTED, {
                    code: this.getActiveEditorCode()
                });
                break;
            case 'savePrompt':
                this.promptForName(message.content).then(name => {
                    if (name) {
                        this._eventBus.emit(eventTypes_1.EventTypes.UI_SAVE_PROMPT_REQUESTED, {
                            name,
                            content: message.content
                        });
                    }
                });
                break;
            case 'deletePrompt':
                this._eventBus.emit(eventTypes_1.EventTypes.UI_DELETE_PROMPT_REQUESTED, {
                    id: message.promptId
                });
                break;
            case 'promptSelected':
                this._eventBus.emit(eventTypes_1.EventTypes.UI_PROMPT_SELECTED, message.promptId);
                break;
        }
    }
    /**
     * Get code from the active editor
     */
    getActiveEditorCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.showMessage('No active editor found. Please open a file.', 'error');
            return '';
        }
        return editor.document.getText();
    }
    /**
     * Prompt the user for a name
     */
    async promptForName(content) {
        return vscode.window.showInputBox({
            prompt: 'Enter a name for this prompt',
            placeHolder: 'My Custom Prompt'
        });
    }
    /**
     * Update the active file status in the webview
     */
    updateActiveFileStatus() {
        const editor = vscode.window.activeTextEditor;
        const fileName = editor ? path.basename(editor.document.fileName) : 'None';
        this._currentFileName = fileName;
        // Notify the logic layer about the file change
        this._eventBus.emit(eventTypes_1.EventTypes.FILE_STATUS_UPDATED, {
            fileName: this._currentFileName
        });
        // Update the webview
        this.updateFileStatus(fileName);
    }
    /**
     * Update the file status in the webview
     */
    updateFileStatus(fileName) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'updateFileStatus',
                fileName
            });
        }
    }
    /**
     * Update the prompts list in the webview
     */
    updatePromptsList(prompts) {
        if (prompts) {
            this._prompts = prompts;
        }
        if (this._view) {
            this._view.webview.postMessage({
                type: 'updatePrompts',
                prompts: this._prompts
            });
        }
    }
    /**
     * Set the prompts list
     */
    setPrompts(prompts) {
        this._prompts = prompts;
        this.updatePromptsList();
    }
    /**
     * Notify the webview that processing has started
     */
    notifyProcessingStarted(payload) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'processingStarted',
                operationType: payload.operationType,
                fileName: payload.fileName
            });
        }
    }
    /**
     * Notify the webview that processing has completed
     */
    notifyProcessingCompleted(payload) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'processingCompleted',
                operationType: payload.operationType,
                result: payload.result,
                fileName: payload.fileName
            });
        }
    }
    /**
     * Notify the webview that processing has failed
     */
    notifyProcessingFailed(payload) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'processingFailed',
                operationType: payload.operationType,
                error: payload.error,
                fileName: payload.fileName
            });
        }
    }
    /**
     * Show a message in the webview
     */
    showMessage(message, type) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'showMessage',
                message,
                messageType: type
            });
        }
    }
}
exports.SidebarPanel = SidebarPanel;
SidebarPanel.viewType = 'aiAssistant.sidebarView';
//# sourceMappingURL=sidebarPanel.js.map