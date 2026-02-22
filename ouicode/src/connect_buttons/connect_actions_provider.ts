import * as vscode from 'vscode';
import { ActionItem } from './connect_buttons';  // Assuming ActionItem is defined here

export class ConnectionActionsProvider implements vscode.TreeDataProvider<ActionItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ActionItem | undefined> = new vscode.EventEmitter<ActionItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<ActionItem | undefined> = this._onDidChangeTreeData.event;

    getTreeItem(element: ActionItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ActionItem): Thenable<ActionItem[]> {
        if (!element) {
            // Return the action items (Host/Join buttons)
            return Promise.resolve([
                new ActionItem('Host Session', 'ouicode.hostSession'),
                new ActionItem('Join Session', 'ouicode.joinSession')
            ]);
        }
        return Promise.resolve([]);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }
}