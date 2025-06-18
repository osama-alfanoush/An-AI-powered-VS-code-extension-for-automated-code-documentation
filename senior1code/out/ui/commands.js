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
exports.registerCommands = registerCommands;
/**
 * VS Code command registrations and implementations
 */
const vscode = __importStar(require("vscode"));
const eventBus_1 = require("../logic/events/eventBus");
const eventTypes_1 = require("../logic/events/eventTypes");
/**
 * Register all extension commands
 */
function registerCommands(context) {
    const eventBus = eventBus_1.EventBus.getInstance();
    // Command to generate documentation for the current file
    const generateDocsCommand = vscode.commands.registerCommand('aiAssistant.generateDocs', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found. Please open a file.');
            return;
        }
        const code = editor.document.getText();
        eventBus.emit(eventTypes_1.EventTypes.UI_GENERATE_DOCS_REQUESTED, {
            code
        });
    });
    // Command to analyze bugs in the current file
    const analyzeBugsCommand = vscode.commands.registerCommand('aiAssistant.analyzeBugs', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found. Please open a file.');
            return;
        }
        const code = editor.document.getText();
        eventBus.emit(eventTypes_1.EventTypes.UI_ANALYZE_BUGS_REQUESTED, {
            code
        });
    });
    // Command to open settings
    const openSettingsCommand = vscode.commands.registerCommand('aiAssistant.openSettings', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', '@ext:yourPublisher.aiAssistant');
    });
    // Command to set API URL
    const setApiUrlCommand = vscode.commands.registerCommand('aiAssistant.setApiUrl', async () => {
        const url = await vscode.window.showInputBox({
            prompt: 'Enter the API URL for the AI backend',
            placeHolder: 'http://localhost:8000'
        });
        if (url) {
            eventBus.emit(eventTypes_1.EventTypes.UI_API_URL_CHANGED, { url });
        }
    });
    // Add all commands to subscriptions
    context.subscriptions.push(generateDocsCommand, analyzeBugsCommand, openSettingsCommand, setApiUrlCommand);
}
//# sourceMappingURL=commands.js.map