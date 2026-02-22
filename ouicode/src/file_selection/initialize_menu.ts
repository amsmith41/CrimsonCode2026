import * as vscode from 'vscode';
import { discoverFiles } from './file_discovery';
import { SharedFileProvider } from './shared_file_provider';

export function initializeMenu(context: vscode.ExtensionContext, mode?: string) {
    const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

    // Build the file tree in-memory. `mode` can be used to select different discovery logic in future.
    const initialTree = rootPath ? discoverFiles(rootPath) : { files: [] };

    // Initialize the tree provider with in-memory data
    const treeProvider = new SharedFileProvider(rootPath, context, initialTree);

    const view = vscode.window.createTreeView('fileShareSelector', {
        treeDataProvider: treeProvider,
        manageCheckboxStateManually: true
    });
    return { view, treeProvider };
}