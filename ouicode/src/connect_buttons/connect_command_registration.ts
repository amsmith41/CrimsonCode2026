import * as vscode from 'vscode';
import { initializeMenu } from '../file_selection/initialize_menu';
import { FileItem } from '../file_selection/shared_file_provider';
import { ConnectionActionsProvider } from './connect_actions_provider';
import { ConfirmConnectionActionsProvider } from './confirm_connect_actions_provider';
import { ActiveSessionDisplayProvider } from '../active_session_display/active_session_display_provider';
import { filterJsonFileList } from '../file_filter';
import { updateHostStatus } from '../extension';
import { isHost } from '../extension';
<<<<<<< Updated upstream
import * as session from '../session';
=======
import { treeToFileList } from '../file_exporter';
import { treeToFileContentList } from '../file_exporter';
>>>>>>> Stashed changes

export function registerConnectionCommands(context: vscode.ExtensionContext): vscode.Disposable[] {

    const disposables: vscode.Disposable[] = [];

    let viewDisposable: vscode.TreeView<FileItem> | undefined;
    let treeProvider: any | undefined;

    const actionsProvider = new ConnectionActionsProvider();
    const confirmActionsProvider = new ConfirmConnectionActionsProvider();
    const statusProvider = new ActiveSessionDisplayProvider();

    // Create the static action views (these show/hide via context when appropriate)
    const actionsView = vscode.window.createTreeView('connectionActions', {
        treeDataProvider: actionsProvider
    });
    disposables.push(actionsView);

    const confirmActionsView = vscode.window.createTreeView('confirmConnectionActions', {
        treeDataProvider: confirmActionsProvider
    });
    disposables.push(confirmActionsView);

    const statusView = vscode.window.createTreeView('activeSessionStatus', {
        treeDataProvider: statusProvider
    });
    disposables.push(statusView);


    const inputCodeDisposable = vscode.commands.registerCommand('ouicode.updateSessionId', async () => {
        const sessionId = await vscode.window.showInputBox({
            prompt: 'Enter Session ID',
            placeHolder: 'Session ID',
            ignoreFocusOut: true
        });
        if (sessionId !== undefined) {
            //sessionInputProvider.setSessionID(sessionId);
            console.log('Session ID updated via command:', sessionId);
        }
    });
    disposables.push(inputCodeDisposable);


    const hostDisposable = vscode.commands.registerCommand('ouicode.hostSession', async () => {
        vscode.window.showInformationMessage('Preparing to Host OuiCode Session...');
        await vscode.commands.executeCommand('setContext', 'ouicodeSessionStarting', true);
        await vscode.commands.executeCommand('setContext', 'ouicodeHostingSession', true);

        if (!treeProvider) {
            const result = initializeMenu(context, 'host');
            viewDisposable = result.view;
            treeProvider = result.treeProvider;

            viewDisposable.onDidChangeSelection(async e => {
                for (const item of e.selection) {
                    if (item instanceof FileItem) {
                        const currentChecked = treeProvider.isChecked(item);
                        const newState = currentChecked ? vscode.TreeItemCheckboxState.Unchecked : vscode.TreeItemCheckboxState.Checked;
                        await treeProvider.handleCheckboxChange(item, newState);
                    }
                }
            });

            viewDisposable.onDidChangeCheckboxState(async e => {
                for (const [item, state] of e.items) {
                    if (item instanceof FileItem) {
                        await treeProvider.handleCheckboxChange(item, state);
                    }
                }
            });

            disposables.push(viewDisposable);
        } else {
            treeProvider.refresh();
        }
        updateHostStatus(true); // Set host status to true when hosting
    });
    disposables.push(hostDisposable);

    const joinDisposable = vscode.commands.registerCommand('ouicode.joinSession', async () => {
        vscode.window.showInformationMessage('Preparing to Join OuiCode Session...');
        await vscode.commands.executeCommand('setContext', 'ouicodeSessionStarting', true);
        await vscode.commands.executeCommand('setContext', 'ouicodeHostingSession', false);
        if (!treeProvider) {
            const result = initializeMenu(context, 'join');
            viewDisposable = result.view;
            treeProvider = result.treeProvider;

            viewDisposable.onDidChangeSelection(async e => {
                for (const item of e.selection) {
                    if (item instanceof FileItem) {
                        const currentChecked = treeProvider.isChecked(item);
                        const newState = currentChecked ? vscode.TreeItemCheckboxState.Unchecked : vscode.TreeItemCheckboxState.Checked;
                        await treeProvider.handleCheckboxChange(item, newState);
                    }
                }
            });

            viewDisposable.onDidChangeCheckboxState(async e => {
                for (const [item, state] of e.items) {
                    if (item instanceof FileItem) {
                        await treeProvider.handleCheckboxChange(item, state);
                    }
                }
            });

            disposables.push(viewDisposable);
        } else {
            treeProvider.refresh();
        }
        await vscode.commands.executeCommand('ouicode.updateSessionId');
        updateHostStatus(false); // Ensure host status is false when joining
    });
    disposables.push(joinDisposable);

    const cancelDisposable = vscode.commands.registerCommand('ouicode.cancelConnection', async () => {
        vscode.window.showInformationMessage('Canceling OuiCode Session...');
        await vscode.commands.executeCommand('setContext', 'ouicodeSessionActive', false);
        await vscode.commands.executeCommand('setContext', 'ouicodeSessionStarting', false);
        updateHostStatus(false); // Reset host status when canceling
        // Keep tree in memory; UI will switch via context
    });
    disposables.push(cancelDisposable);

    const confirmDisposable = vscode.commands.registerCommand('ouicode.confirmConnection', async () => {

        vscode.window.showInformationMessage('Confirming OuiCode Session...');

        await vscode.commands.executeCommand('setContext', 'ouicodeSessionActive', true);
        await vscode.commands.executeCommand('setContext', 'ouicodeSessionStarting', false);



        if (isHost()) {
            session.beginServerSession(context, treeProvider.getInMemoryTree());
            vscode.window.showInformationMessage('Session hosted successfully! Waiting for others to join...');
            testFileExport();
        } else {
            session.beginClientSession(context);
            vscode.window.showInformationMessage('Joined session successfully!');
        }

        if (treeProvider) {
            const tree = filterJsonFileList(treeProvider.getInMemoryTree());
            // TODO: send tree and sessionId over connection
            console.log('Tree to send:', tree);
            statusProvider.updateConnectionStatus(true);
        }
    });
    disposables.push(confirmDisposable);

    function testFileExport() {
        const sampleTree = filterJsonFileList(treeProvider.getInMemoryTree());
        const fileList = treeToFileList(sampleTree);
        console.log('Testing file list:', fileList);
        const fileContentList = treeToFileContentList(sampleTree);
        console.log('Testing file content list:', fileContentList);
    }

    return disposables;
}
