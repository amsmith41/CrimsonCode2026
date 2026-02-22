import * as vscode from 'vscode';
import { ActionItem } from './connect_buttons';  // Assuming ActionItem is defined here

export class ConfirmConnectionActionsProvider implements vscode.TreeDataProvider<ActionItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ActionItem | undefined> = new vscode.EventEmitter<ActionItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<ActionItem | undefined> = this._onDidChangeTreeData.event;

    getTreeItem(element: ActionItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ActionItem): Thenable<ActionItem[]> {
        if (!element) {
            // Return the action items (Host/Join buttons)
            return Promise.resolve([
                new ActionItem('Confirm Connection', 'ouicode.confirmConnection'),
                new ActionItem('Cancel Connection', 'ouicode.cancelConnection')
            ]);
        }
        return Promise.resolve([]);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }
}