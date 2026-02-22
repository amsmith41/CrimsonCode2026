import * as vscode from 'vscode';
import { registerConnectionCommands } from './connect_buttons/connect_command_registration';

export function activate(context: vscode.ExtensionContext) {
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
