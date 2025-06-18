import * as vscode from "vscode";
import * as path from "path";

interface SavedPrompt {
    name: string;
    content: string;
}

export class CustomSidebarViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "vscodeSidebar.openview";
    private _view?: vscode.WebviewView;
    private _prompts: SavedPrompt[] = [];
    
    private readonly _defaultPrompt = `Generate Google-style documentation for this code. Include:
1. Brief description of functionality
2. Args/Parameters section with types
3. Returns section with type and description
4. Raises/Exceptions section
5. Examples of usage
6. Any important notes`;

    private readonly _predefinedPrompts: SavedPrompt[] = [
        {
            name: "[System] Bug Detection",
            content: `Analyze for:
1. Syntax errors
2. Logical errors
3. Potential runtime issues
4. Suggested fixes
5. Optimization opportunities`
        },
        {
            name: "[System] Auto-Documentation",
            content: this._defaultPrompt
        },
        {
            name: "[System] Code Review",
            content: `Review the code for:
1. Code quality assessment
2. Potential improvements
3. Best practices violations
4. Security concerns
5. Performance considerations`
        }
    ];

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public async resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;
        this._prompts = await this.loadSavedPrompts();

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'generateDocs':
                    await this.handleGenerateDocs(message.prompt);
                    break;
                case 'analyzeBugs':
                    await this.handleAnalyzeBugs();
                    break;
                case 'requestSavePrompt':
                    await this.handleSavePromptRequest(message.content);
                    break;
                case 'requestDeletePrompt':
                    await this.handleDeletePromptRequest(message.name);
                    break;
                case 'getInitialState':
                    // Send prompts and file status when webview is initialized
                    this.sendPromptsToWebview();
                    this.updateFileStatus();
                    break;
            }
        });
    }

    private async handleGenerateDocs(customPrompt: string) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Please open a file first!');
            return;
        }

        try {
            const doc = editor.document;
            const code = doc.getText();
            
            const systemPrompt = customPrompt.trim() || this._defaultPrompt;
            const finalPrompt = `${systemPrompt}\n\nCode:\n${code}`;

            const response = await fetch('http://localhost:8000/generate-docs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: finalPrompt }),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const data = await response.json();
            await this.saveDocumentation(doc, data.result);
            
        } catch (error) {
            vscode.window.showErrorMessage('Documentation generation failed: ' + 
                (error instanceof Error ? error.message : 'Unknown error'));
        }
    }

    private async saveDocumentation(doc: vscode.TextDocument, content: string) {
        const baseName = path.basename(doc.fileName, path.extname(doc.fileName));
        const docPath = path.join(path.dirname(doc.fileName), `${baseName}_doc.txt`);
        const uri = vscode.Uri.file(docPath);
        
        await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
        vscode.window.showTextDocument(uri);
    }
    
    private _getHtmlForWebview(webview: vscode.Webview): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" 
                  content="default-src 'none';
                          script-src ${webview.cspSource} 'unsafe-inline';
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
                    height:40px;
                    padding: 12px;
                    background: var(--input-bg);
                    color: var(--input-fg);
                    border: 1px solid var(--border);
                    border-radius: 4px;
      
                    font-family: var(--vscode-editor-font-family);
                    font-size: 15px;
                    line-height: 1.5;
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

                .error-message {
                    color: var(--error-fg);
                    background: var(--error-bg);
                    padding: 12px;
                    border-radius: 4px;
                    margin: 12px 0;
                    display: none;
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
                <div class="status-bar" id="fileStatus">Current file: None</div>
            </div>

            <div class="prompt-section">
                <select class="prompt-selector" id="promptSelect">
                    <option value="">Select a template...</option>
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
                    <div class="prompt-list" id="promptList"></div>
                </div>

                <div class="response-container">
                    <pre class="response-content" id="responseContent"></pre>
                </div>
            </div>

            <div class="loading-overlay" id="loadingOverlay">
                <div class="loading-spinner"></div>
            </div>

            <div class="error-message" id="errorMessage"></div>

            <script>
                const vscode = acquireVsCodeApi();
                
                let state = {
                    prompts: [],
                    activeFile: 'None',
                    isLoading: false,
                    error: null,
                    response: ''
                };

                function render() {
                    const promptSelect = document.getElementById('promptSelect');
                    promptSelect.innerHTML = '<option value="">Select a template...</option>';
                    state.prompts.forEach(prompt => {
                        const option = document.createElement('option');
                        option.value = prompt.name;
                        option.textContent = prompt.name;
                        promptSelect.appendChild(option);
                    });

                    document.getElementById('responseContent').textContent = state.response;
                    document.getElementById('fileStatus').textContent = \`Current file: \${state.activeFile}\`;
                    document.getElementById('loadingOverlay').style.display = 
                        state.isLoading ? 'flex' : 'none';
                    
                    const errorElement = document.getElementById('errorMessage');
                    errorElement.textContent = state.error || '';
                    errorElement.style.display = state.error ? 'block' : 'none';
                }

                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.type) {
                        case 'promptList':
                            state.prompts = message.prompts;
                            break;
                        case 'fileUpdate':
                            state.activeFile = message.content;
                            break;
                        case 'response':
                            state.response = message.content;
                            state.isLoading = false;
                            break;
                        case 'error':
                            state.error = message.content;
                            state.isLoading = false;
                            break;
                    }
                    render();
                });

                document.getElementById('generateBtn').addEventListener('click', () => {
                    state.isLoading = true;
                    state.error = null;
                    render();
                    vscode.postMessage({
                        command: 'generateDocs',
                        prompt: document.getElementById('promptEditor').value
                    });
                });

                document.getElementById('analyzeBtn').addEventListener('click', () => {
                    state.isLoading = true;
                    state.error = null;
                    render();
                    vscode.postMessage({ command: 'analyzeBugs' });
                });

                document.getElementById('promptSelect').addEventListener('change', (event) => {
                    const selectedPrompt = state.prompts.find(p => p.name === event.target.value);
                    if (selectedPrompt) {
                        document.getElementById('promptEditor').value = selectedPrompt.content;
                    }
                });

                document.getElementById('savePromptBtn').addEventListener('click', () => {
                    const content = document.getElementById('promptEditor').value;
                    if (!content.trim()) {
                        state.error = 'Please enter prompt content before saving';
                        render();
                        return;
                    }
                    vscode.postMessage({ command: 'requestSavePrompt', content });
                });

                document.getElementById('deletePromptBtn').addEventListener('click', () => {
                    const selected = document.getElementById('promptSelect').value;
                    if (!selected) {
                        state.error = 'Please select a prompt to delete';
                        render();
                        return;
                    }
                    vscode.postMessage({ command: 'requestDeletePrompt', name: selected });
                });

                // Request initial state when webview loads
                vscode.postMessage({ command: 'getInitialState' });
            </script>
        </body>
        </html>`;
    }

    private async loadSavedPrompts(): Promise<SavedPrompt[]> {
        const userPrompts = await vscode.commands.executeCommand<SavedPrompt[]>(
            'vscodeSidebar.getSavedPrompts'
        ) || [];
        return [...this._predefinedPrompts, ...userPrompts];
    }

    private async handleSavePromptRequest(content: string) {
        try {
            const name = await vscode.window.showInputBox({
                prompt: 'Enter prompt name',
                placeHolder: 'My Custom Prompt'
            });

            if (!name) return;

            const existing = this._prompts.find(p => p.name === name);
            if (existing) {
                const overwrite = await vscode.window.showQuickPick(
                    ['Overwrite', 'Cancel'], 
                    { placeHolder: 'Prompt "' + name + '" exists. Overwrite?' }
                );
                if (overwrite !== 'Overwrite') return;
            }

            const newPrompt = { name, content };
            this._prompts = this._prompts.filter(p => p.name !== name);
            this._prompts.push(newPrompt);
            
            // Save only user-created prompts (non-system prompts)
            await vscode.commands.executeCommand('vscodeSidebar.savePrompts', 
                this._prompts.filter(p => !p.name.startsWith('[System]'))
            );
            
            this.sendPromptsToWebview();
            
            this._view?.webview.postMessage({
                type: 'response',
                content: 'Prompt "' + name + '" saved successfully'
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._view?.webview.postMessage({
                type: 'error',
                content: 'Failed to save prompt: ' + errorMessage
            });
        }
    }

    private async handleDeletePromptRequest(name: string) {
        try {
            // Check if trying to delete a system prompt
            if (name.startsWith('[System]')) {
                this._view?.webview.postMessage({
                    type: 'error',
                    content: 'System prompts cannot be deleted'
                });
                return;
            }
            
            // First update the local prompts list
            this._prompts = this._prompts.filter(p => p.name !== name);
            
            // Then save the filtered list (excluding system prompts) to persistent storage
            await vscode.commands.executeCommand(
                'vscodeSidebar.savePrompts', 
                this._prompts.filter(p => !p.name.startsWith('[System]'))
            );
            
            // Update the webview
            this.sendPromptsToWebview();
            
            this._view?.webview.postMessage({
                type: 'response',
                content: 'Prompt "' + name + '" deleted successfully'
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._view?.webview.postMessage({
                type: 'error',
                content: 'Failed to delete prompt: ' + errorMessage
            });
        }
    }

    private sendPromptsToWebview() {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'promptList',
                prompts: this._prompts
            });
        }
    }

    private async handleAnalyzeBugs() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this._view?.webview.postMessage({
                type: 'error',
                content: 'Please open a file to analyze'
            });
            return;
        }

        try {
            const code = editor.document.getText();
            const response = await fetch('http://localhost:8000/analyze-bugs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: code }),
            });

            if (!response.ok) throw new Error(await response.text());
            
            const data = await response.json();
            this._view?.webview.postMessage({
                type: 'response',
                content: data.result
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage('Analysis failed: ' + errorMessage);
            this._view?.webview.postMessage({
                type: 'error',
                content: 'Analysis failed: ' + errorMessage
            });
        }
    }

    public generateDocumentation() {
        const prompt = this._defaultPrompt;
        this.handleGenerateDocs(prompt);
    }

    public analyzeForBugs() {
        this.handleAnalyzeBugs();
    }

    public updateFileStatus() {
        const editor = vscode.window.activeTextEditor;
        const fileName = editor ? path.basename(editor.document.fileName) : 'None';
        
        if (this._view) {
            this._view.webview.postMessage({
                type: 'fileUpdate',
                content: fileName
            });
        }
    }
}