import * as vscode from 'vscode';
import { CustomSidebarViewProvider } from './customSidebarViewProvider';

export function activate(context: vscode.ExtensionContext) {
    // Register the sidebar provider
    const provider = new CustomSidebarViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            CustomSidebarViewProvider.viewType,
            provider
        )
    );

    // Register commands for prompt management
    context.subscriptions.push(
        vscode.commands.registerCommand('vscodeSidebar.savePrompts', async (prompts) => {
            try {
                await context.globalState.update('savedPrompts', prompts);
                return true;
            } catch (error) {
                console.error('Failed to save prompts:', error);
                return false;
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('vscodeSidebar.getSavedPrompts', () => {
            try {
                return context.globalState.get<Array<any>>('savedPrompts', []);
            } catch (error) {
                console.error('Failed to get saved prompts:', error);
                return [];
            }
        })
    );

    // Register commands for code analysis
    context.subscriptions.push(
        vscode.commands.registerCommand('vscodeSidebar.generateDocs', () => {
            provider.generateDocumentation();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('vscodeSidebar.analyzeCode', () => {
            provider.analyzeForBugs();
        })
    );

    // Update file status when active editor changes
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(() => {
            provider.updateFileStatus();
        })
    );

    // Show welcome message
    vscode.window.showInformationMessage('Code Assistant is now active!');
}

export function deactivate() {}