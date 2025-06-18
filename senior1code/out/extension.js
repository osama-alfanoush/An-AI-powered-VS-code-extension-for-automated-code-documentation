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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const customSidebarViewProvider_1 = require("./customSidebarViewProvider");
function activate(context) {
    // Register the sidebar provider
    const provider = new customSidebarViewProvider_1.CustomSidebarViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(customSidebarViewProvider_1.CustomSidebarViewProvider.viewType, provider));
    // Register commands for prompt management
    context.subscriptions.push(vscode.commands.registerCommand('vscodeSidebar.savePrompts', async (prompts) => {
        try {
            await context.globalState.update('savedPrompts', prompts);
            return true;
        }
        catch (error) {
            console.error('Failed to save prompts:', error);
            return false;
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('vscodeSidebar.getSavedPrompts', () => {
        try {
            return context.globalState.get('savedPrompts', []);
        }
        catch (error) {
            console.error('Failed to get saved prompts:', error);
            return [];
        }
    }));
    // Register commands for code analysis
    context.subscriptions.push(vscode.commands.registerCommand('vscodeSidebar.generateDocs', () => {
        provider.generateDocumentation();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('vscodeSidebar.analyzeCode', () => {
        provider.analyzeForBugs();
    }));
    // Update file status when active editor changes
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
        provider.updateFileStatus();
    }));
    // Show welcome message
    vscode.window.showInformationMessage('Code Assistant is now active!');
}
function deactivate() { }
//# sourceMappingURL=extension.js.map