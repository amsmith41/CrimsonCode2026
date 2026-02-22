// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { initializeMenu } from './file_selection/initialize_menu';
import { FileItem } from './file_selection/shared_file_provider';
import { ConnectionActionsProvider } from './connect_buttons/connect_actions_provider';
import { ConfirmConnectionActionsProvider } from './connect_buttons/confirm_connect_actions_provider';
import { ActiveSessionDisplayProvider } from './active_session_display/active_session_display_provider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "ouicode" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('ouicode.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from OuiCode!');
	});

	// Initialize context variable on startup
	vscode.commands.executeCommand('setContext', 'ouicodeSessionActive', false);
	vscode.commands.executeCommand('setContext', 'ouicodeSessionStarting', false);

	// Initialize the menu and get the TreeView and TreeDataProvider instances
	const initializationResult = initializeMenu(context);
	const viewDisposable = initializationResult.view;
	const treeProvider = initializationResult.treeProvider;
	const actionsProvider = new ConnectionActionsProvider();
	const confirmActionsProvider = new ConfirmConnectionActionsProvider();
	const statusProvider = new ActiveSessionDisplayProvider();

	const hostDisposable = vscode.commands.registerCommand('ouicode.hostSession', async () => {
		// TODO: Implement hosting logic
		vscode.window.showInformationMessage('Hosting OuiCode Session...');
		await vscode.commands.executeCommand('setContext', 'ouicodeSessionStarting', true);
	});

	const joinDisposable = vscode.commands.registerCommand('ouicode.joinSession', async () => {
		// TODO: Implement joining logic
		vscode.window.showInformationMessage('Joining OuiCode Session...');
		await vscode.commands.executeCommand('setContext', 'ouicodeSessionStarting', true);
	});

	const cancelConnectionDisposable = vscode.commands.registerCommand('ouicode.cancelConnection', async () => {
		vscode.window.showInformationMessage('Canceling OuiCode Session...');
		await vscode.commands.executeCommand('setContext', 'ouicodeSessionActive', false);
		await vscode.commands.executeCommand('setContext', 'ouicodeSessionStarting', false);
	});

	const confirmConnectionDisposable = vscode.commands.registerCommand('ouicode.confirmConnection', async () => {
		vscode.window.showInformationMessage('Confirming OuiCode Session...');
		await vscode.commands.executeCommand('setContext', 'ouicodeSessionActive', true);
		await vscode.commands.executeCommand('setContext', 'ouicodeSessionStarting', false);
		statusProvider.updateConnectionStatus(true);
	});


	const actionsView = vscode.window.createTreeView('connectionActions', {
		treeDataProvider: actionsProvider
	});

	const confirmActionsView = vscode.window.createTreeView('confirmConnectionActions', {
		treeDataProvider: confirmActionsProvider
	});
	const statusView = vscode.window.createTreeView('activeSessionStatus', {
		treeDataProvider: statusProvider
	});


	// Handle selection to toggle checkboxes
	viewDisposable.onDidChangeSelection(async e => {
		for (const item of e.selection) {
			if (item instanceof FileItem) {
				const currentChecked = treeProvider.isChecked(item);
				const newState = currentChecked ? vscode.TreeItemCheckboxState.Unchecked : vscode.TreeItemCheckboxState.Checked;
				await treeProvider.handleCheckboxChange(item, newState);
			}
		}
	});
	// Handle checkbox state changes (in case checkboxes are toggled directly)
	viewDisposable.onDidChangeCheckboxState(async e => {
		for (const [item, state] of e.items) {
			if (item instanceof FileItem) {
				await treeProvider.handleCheckboxChange(item, state);
			}
		}
	});
	context.subscriptions.push(viewDisposable);

	context.subscriptions.push(disposable);
	context.subscriptions.push(hostDisposable);
	context.subscriptions.push(joinDisposable);
	context.subscriptions.push(cancelConnectionDisposable);
	context.subscriptions.push(confirmConnectionDisposable);
	context.subscriptions.push(actionsView);
}

// This method is called when your extension is deactivated
export function deactivate() { }
