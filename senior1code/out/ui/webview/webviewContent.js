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
exports.getWebviewContent = getWebviewContent;
/**
 * HTML content for the sidebar webview
 */
const vscode = __importStar(require("vscode"));
/**
 * Generate the HTML for the sidebar webview
 */
function getWebviewContent(webview, extensionUri, prompts = [], currentFile = 'None') {
    // Create a URI to the script file
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'main.js'));
    // Create URIs for stylesheets
    const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'reset.css'));
    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'vscode.css'));
    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'main.css'));
    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" 
              content="default-src 'none';
                      script-src 'nonce-${nonce}';
                      style-src ${webview.cspSource} 'unsafe-inline';">
        <style>
            :root {
                --vscode-font-family: -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", system-ui, "Ubuntu", "Droid Sans", sans-serif;
                --background: var(--vscode-sideBar-background);
                --foreground: var(--vscode-sideBar-foreground);
                --border: var(--vscode-sideBar-border);
                --button-bg: var(--vscode-button-background);
                --button-fg: var(--vscode-button-foreground);
                --input-bg: var(--vscode-input-background);
                --input-fg: var(--vscode-input-foreground);
                --error-bg: var(--vscode-inputValidation-errorBackground);
                --error-fg: var(--vscode-inputValidation-errorForeground);
            }

            body {
                font-family: var(--vscode-font-family);
                background: var(--background);
                color: var(--foreground);
                padding: 0 16px 16px;
                margin: 0;
                height: 100vh;
                display: flex;
                flex-direction: column;
            }

            .header {
                padding: 16px 0;
                border-bottom: 1px solid var(--border);
                margin-bottom: 16px;
            }

            .header-title {
                font-size: 16px;
                font-weight: 600;
                margin: 0 0 8px;
            }

            .status-bar {
                font-size: 12px;
                color: var(--vscode-descriptionForeground);
            }

            .prompt-section {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .prompt-selector {
                width: 100%;
                padding: 8px;
                background: var(--input-bg);
                color: var(--input-fg);
                border: 1px solid var(--border);
                border-radius: 4px;
                font-family: inherit;
            }

            .prompt-editor {
                flex: 1;
                width: 100%;
                padding: 12px;
                background: var(--input-bg);
                color: var(--input-fg);
                border: 1px solid var(--border);
                border-radius: 4px;
                resize: none;
                font-family: var(--vscode-editor-font-family);
                font-size: var(--vscode-editor-font-size);
                line-height: 1.5;
                min-height: 120px;
            }

            .button-group {
                display: flex;
                gap: 8px;
                margin-top: 12px;
            }

            .btn {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-family: inherit;
                font-weight: 600;
                transition: opacity 0.2s, transform 0.1s;
            }

            .btn:active {
                transform: scale(0.98);
            }

            .btn-primary {
                background: var(--button-bg);
                color: var(--button-fg);
            }

            .btn-secondary {
                background: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
            }

            .btn-danger {
                background: var(--vscode-errorForeground);
                color: white;
            }

            .response-container {
                flex: 2;
                margin-top: 16px;
                padding: 16px;
                background: var(--vscode-editor-background);
                border-radius: 4px;
                overflow-y: auto;
            }

            .response-content {
                white-space: pre-wrap;
                font-family: var(--vscode-editor-font-family);
                font-size: var(--vscode-editor-font-size);
                line-height: 1.5;
            }

            .loading-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }

            .loading-spinner {
                animation: spin 1s linear infinite;
                width: 24px;
                height: 24px;
                border: 3px solid var(--button-bg);
                border-radius: 50%;
                border-top-color: transparent;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .message-container {
                color: var(--error-fg);
                background: var(--error-bg);
                padding: 12px;
                border-radius: 4px;
                margin: 12px 0;
                display: none;
            }

            .success {
                background: var(--vscode-terminal-ansiGreen);
                color: white;
            }

            .warning {
                background: var(--vscode-terminal-ansiYellow);
                color: black;
            }

            .prompt-management {
                margin-top: 16px;
                border-top: 1px solid var(--border);
                padding-top: 16px;
            }

            .prompt-list {
                max-height: 200px;
                overflow-y: auto;
                margin: 12px 0;
            }

            .prompt-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px;
                margin: 4px 0;
                background: var(--vscode-list-hoverBackground);
                border-radius: 4px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h2 class="header-title">AI Code Assistant</h2>
            <div class="status-bar" id="fileStatus">Current file: ${currentFile}</div>
        </div>

        <div class="prompt-section">
            <select class="prompt-selector" id="promptSelect">
                <option value="">Select a template...</option>
                ${prompts.map(prompt => `<option value="${prompt.id}">${prompt.name}</option>`).join('')}
            </select>

            <textarea class="prompt-editor" 
                      id="promptEditor" 
                      placeholder="Enter your custom prompt here..."></textarea>

            <div class="button-group">
                <button class="btn btn-primary" id="generateBtn">
                    Generate Documentation
                </button>
                <button class="btn btn-danger" id="analyzeBtn">
                    Analyze Code
                </button>
            </div>

            <div class="prompt-management">
                <div class="button-group">
                    <button class="btn btn-secondary" id="savePromptBtn">
                        Save Prompt
                    </button>
                    <button class="btn btn-secondary" id="deletePromptBtn">
                        Delete Prompt
                    </button>
                </div>
            </div>

            <div class="message-container" id="messageContainer"></div>

            <div class="response-container">
                <pre class="response-content" id="responseContent"></pre>
            </div>
        </div>

        <div class="loading-overlay" id="loadingOverlay">
            <div class="loading-spinner"></div>
        </div>

        <script nonce="${nonce}">
            // Store the VS Code API instance
            const vscode = acquireVsCodeApi();
            
            // State management
            let state = {
                prompts: ${JSON.stringify(prompts)},
                activeFile: '${currentFile}',
                isLoading: false,
                message: null,
                messageType: 'info',
                response: ''
            };

            // Track when the webview is ready
            let webviewReady = false;

            // Initialize the UI with the current state
            function updateUI() {
                // Update prompt dropdown
                const promptSelect = document.getElementById('promptSelect');
                promptSelect.innerHTML = '<option value="">Select a template...</option>';
                state.prompts.forEach(prompt => {
                    const option = document.createElement('option');
                    option.value = prompt.id;
                    option.textContent = prompt.name;
                    promptSelect.appendChild(option);
                });

                // Update file status
                document.getElementById('fileStatus').textContent = \`Current file: \${state.activeFile}\`;
                
                // Update loading state
                document.getElementById('loadingOverlay').style.display = 
                    state.isLoading ? 'flex' : 'none';
                
                // Update message
                const messageContainer = document.getElementById('messageContainer');
                if (state.message) {
                    messageContainer.textContent = state.message;
                    messageContainer.style.display = 'block';
                    messageContainer.className = 'message-container ' + state.messageType;
                    
                    // Auto-hide success messages after 5 seconds
                    if (state.messageType === 'success') {
                        setTimeout(() => {
                            messageContainer.style.display = 'none';
                            state.message = null;
                        }, 5000);
                    }
                } else {
                    messageContainer.style.display = 'none';
                }
                
                // Update response content
                document.getElementById('responseContent').textContent = state.response;
            }

            // Select a prompt from the dropdown
            document.getElementById('promptSelect').addEventListener('change', (event) => {
                const selectedPromptId = event.target.value;
                if (!selectedPromptId) return;
                
                const selectedPrompt = state.prompts.find(p => p.id === selectedPromptId);
                if (selectedPrompt) {
                    document.getElementById('promptEditor').value = selectedPrompt.content;
                    vscode.postMessage({ command: 'promptSelected', promptId: selectedPrompt.id });
                }
            });

            // Generate documentation
            document.getElementById('generateBtn').addEventListener('click', () => {
                const editor = document.getElementById('promptEditor');
                const customPrompt = editor.value.trim();
                const selectedPromptId = document.getElementById('promptSelect').value;
                
                if (!customPrompt && !selectedPromptId) {
                    state.message = 'Please select a template or enter a custom prompt';
                    state.messageType = 'error';
                    updateUI();
                    return;
                }
                
                state.isLoading = true;
                state.message = null;
                updateUI();
                
                vscode.postMessage({ 
                    command: 'generateDocs', 
                    customPrompt, 
                    promptId: selectedPromptId
                });
            });

            // Analyze code
            document.getElementById('analyzeBtn').addEventListener('click', () => {
                state.isLoading = true;
                state.message = null;
                updateUI();
                
                vscode.postMessage({ command: 'analyzeBugs' });
            });

            // Save prompt
            document.getElementById('savePromptBtn').addEventListener('click', () => {
                const content = document.getElementById('promptEditor').value.trim();
                if (!content) {
                    state.message = 'Please enter prompt content before saving';
                    state.messageType = 'error';
                    updateUI();
                    return;
                }
                
                vscode.postMessage({ command: 'savePrompt', content });
            });

            // Delete prompt
            document.getElementById('deletePromptBtn').addEventListener('click', () => {
                const selectedPromptId = document.getElementById('promptSelect').value;
                if (!selectedPromptId) {
                    state.message = 'Please select a prompt to delete';
                    state.messageType = 'error';
                    updateUI();
                    return;
                }
                
                const selectedPrompt = state.prompts.find(p => p.id === selectedPromptId);
                if (selectedPrompt && selectedPrompt.isSystem) {
                    state.message = 'System prompts cannot be deleted';
                    state.messageType = 'error';
                    updateUI();
                    return;
                }
                
                vscode.postMessage({ command: 'deletePrompt', promptId: selectedPromptId });
            });

            // Handle messages from the extension
            window.addEventListener('message', event => {
                const message = event.data;
                
                switch (message.type) {
                    case 'updatePrompts':
                        state.prompts = message.prompts;
                        break;
                    case 'updateFileStatus':
                        state.activeFile = message.fileName;
                        break;
                    case 'processingStarted':
                        state.isLoading = true;
                        break;
                    case 'processingCompleted':
                        state.isLoading = false;
                        state.response = message.result;
                        break;
                    case 'processingFailed':
                        state.isLoading = false;
                        state.message = message.error;
                        state.messageType = 'error';
                        break;
                    case 'showMessage':
                        state.message = message.message;
                        state.messageType = message.messageType || 'info';
                        break;
                    case 'promptSaved':
                        state.prompts = message.prompts;
                        state.message = 'Prompt saved successfully';
                        state.messageType = 'success';
                        break;
                    case 'promptDeleted':
                        state.prompts = message.prompts;
                        state.message = 'Prompt deleted successfully';
                        state.messageType = 'success';
                        break;
                }
                
                updateUI();
            });

            // Initial UI update
            updateUI();
            
            // Notify the extension that the webview is ready
            if (!webviewReady) {
                webviewReady = true;
                vscode.postMessage({ command: 'webviewReady' });
            }
        </script>
    </body>
    </html>`;
}
/**
 * Generate a nonce for CSP
 */
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=webviewContent.js.map