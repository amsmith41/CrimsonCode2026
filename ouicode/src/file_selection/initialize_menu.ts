import * as vscode from 'vscode';
import { saveFileTree } from './file_discovery'; import { SharedFileProvider } from './shared_file_provider';

export function initializeMenu(context: vscode.ExtensionContext) {
    const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

    // Save the file tree to JSON
    saveFileTree(context, "HostFiles.json");

    // Initialize the tree provider
    const treeProvider = new SharedFileProvider(rootPath, context);

    const view = vscode.window.createTreeView('fileShareSelector', {
        treeDataProvider: treeProvider,
        manageCheckboxStateManually: true
    });
    return { view, treeProvider };
}