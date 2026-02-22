import * as vscode from 'vscode';
import { registerConnectionCommands } from './connect_buttons/connect_command_registration';

let sessionIsHost: boolean = false; // This will track whether the current session is hosting or joining

export function activate(context: vscode.ExtensionContext) {
    updateHostStatus(false);

    console.log('Congratulations, your extension "ouicode" is now active!');

    const disposable = vscode.commands.registerCommand('ouicode.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from OuiCode!');
    });

    vscode.commands.executeCommand('setContext', 'ouicodeSessionActive', false);
    vscode.commands.executeCommand('setContext', 'ouicodeSessionStarting', false);
    vscode.commands.executeCommand('setContext', 'ouicodeHostingSession', false);

    const connectionDisposables = registerConnectionCommands(context);
    for (const d of connectionDisposables) context.subscriptions.push(d);

    context.subscriptions.push(disposable);
}

export function deactivate() { }



export function isHost(): boolean {
    return sessionIsHost;
}

/**
 * 3. A helper to update the internal variable AND the VS Code UI context at once.
 */
export async function updateHostStatus(status: boolean) {
    sessionIsHost = status;
    // This allows you to use "when": "ouicodeHostingSession" in package.json
    await vscode.commands.executeCommand('setContext', 'ouicodeHostingSession', status);
}