import * as vscode from 'vscode';
import { ActionItem } from '../connect_buttons/connect_buttons';  // Assuming ActionItem is defined here
import { ref } from 'process';

export class ActiveSessionDisplayProvider implements vscode.TreeDataProvider<StatusItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<StatusItem | undefined> = new vscode.EventEmitter<StatusItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<StatusItem | undefined> = this._onDidChangeTreeData.event;

    private isConnected: boolean = false;
    getTreeItem(element: StatusItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: StatusItem): Promise<StatusItem[]> {
        if (!element) {
            if (this.isConnected) {
                return [
                    new StatusItem('🟢 Connected', 'connected'),
                ];
            } else {
                return [
                    new StatusItem('🔴 Disconnected', 'disconnected'),
                ];
            }
        }
        return [];
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }
    updateConnectionStatus(_isConnected: boolean): void {
        this.isConnected = _isConnected;
        if (this.isConnected) {
            vscode.commands.executeCommand('setContext', 'ouicodeSessionActive', true);
            vscode.commands.executeCommand('setContext', 'ouicodeSessionStarting', false);
        } else {
            vscode.commands.executeCommand('setContext', 'ouicodeSessionActive', false);
            vscode.commands.executeCommand('setContext', 'ouicodeSessionStarting', false);
        }
        this.refresh();
    }
}

export class StatusItem extends vscode.TreeItem {
    constructor(
        label: string,
        public readonly status?: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.tooltip = label;
        // No command set, so it's just a display item (not clickable)
    }
}