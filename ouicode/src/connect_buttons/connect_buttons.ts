import * as vscode from 'vscode';

// ActionItem class represents action buttons in the TreeView
export class ActionItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly commandId: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.tooltip = label;
        this.command = {
            command: commandId,
            title: label,
            arguments: []
        };
    }
}

// Function to get the action items for the tree view
export function getActionItems(): ActionItem[] {
    return [
        new ActionItem('Host Session', 'ouicode.hostSession'),
        new ActionItem('Join Session', 'ouicode.joinSession')
    ];
}