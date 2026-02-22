import * as vscode from 'vscode';

export class SharedFileProvider implements vscode.TreeDataProvider<FileItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined> = new vscode.EventEmitter<FileItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<FileItem | undefined> = this._onDidChangeTreeData.event;
    private tree: any = null;

    constructor(private workspaceRoot: string | undefined, private context: vscode.ExtensionContext, initialTree?: any) {
        // Use provided in-memory tree or initialize empty
        this.tree = initialTree ?? { files: [] };
    }

    // Refresh the TreeView by firing the change event
    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }
    // Expose the in-memory tree for callers that need to operate on it
    public getInMemoryTree(): any {
        return this.tree;
    }
    // Get the TreeItem representation of a FileItem, setting the checkbox state based on the tree data
    getTreeItem(element: FileItem): vscode.TreeItem {
        const node = this.findNode(this.tree, element.fsPath);
        if (node) {
            element.checkboxState = node.selected ? vscode.TreeItemCheckboxState.Checked : vscode.TreeItemCheckboxState.Unchecked;
        }
        return element;
    }
    // Get the children of a given FileItem. If no element is provided, return the root files. Otherwise, find the corresponding node and return its children.
    async getChildren(element?: FileItem): Promise<FileItem[]> {
        if (!this.tree || !this.tree.files) {
            return [];
        }

        if (!element) {
            const fileItems = this.tree.files.map((child: any) => this.createFileItem(child));
            return fileItems;  // Only return file items, not action items
        } else {
            const node = this.findNode(this.tree, element.fsPath);
            if (node && node.type === 'folder' && node.children) {
                return node.children.map((child: any) => this.createFileItem(child));
            }
            return [];
        }
    }
    // Create a FileItem from a tree node, setting the label, collapsible state, and file system path
    private createFileItem(node: any): FileItem {
        return new FileItem(
            node.name,
            node.type === 'folder' ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
            node.path
        );
    }
    // Find the node in the tree that corresponds to the given file system path
    private findNode(tree: any, fsPath: string): any {
        if (!tree) return null;
        if (tree.files) {
            for (const child of tree.files) {
                const found = this.findNodeRecursive(child, fsPath);
                if (found) return found;
            }
        }
        return null;
    }
    // Recursive helper to find a node by file system path
    private findNodeRecursive(node: any, fsPath: string): any {
        if (node.path === fsPath) return node;
        if (node.children) {
            for (const child of node.children) {
                const found = this.findNodeRecursive(child, fsPath);
                if (found) return found;
            }
        }
        return null;
    }
    // Get all file paths from a node (if it's a folder, get all files within it)
    private getAllFilesFromNode(node: any): string[] {
        if (!node) return [];
        if (node.type === 'file') return [node.path];
        const result: string[] = [];
        if (node.children) {
            for (const child of node.children) {
                result.push(...this.getAllFilesFromNode(child));
            }
        }
        return result;
    }
    // Check if a given FileItem is currently selected (checked)
    isChecked(item: FileItem): boolean {
        const node = this.findNode(this.tree, item.fsPath);
        return node ? node.selected : false;
    }
    // Handle checkbox state changes when a user toggles a checkbox in the TreeView
    async handleCheckboxChange(item: FileItem, state: vscode.TreeItemCheckboxState): Promise<void> {
        const node = this.findNode(this.tree, item.fsPath);
        if (!node) return;

        const selected = state === vscode.TreeItemCheckboxState.Checked;
        this.updateNodeSelected(node, selected);

        // No persistent storage: update in-memory state and refresh the view
        this.refresh();
    }
    // Recursively update the 'selected' state of a node and all its children
    private updateNodeSelected(node: any, selected: boolean) {
        node.selected = selected;
        if (node.children) {
            for (const child of node.children) {
                this.updateNodeSelected(child, selected);
            }
        }
    }
}
// FileItem class represents each item in the TreeView, with label, collapsible state, and file system path
export class FileItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly fsPath: string
    ) {
        super(label, collapsibleState);
        this.tooltip = this.fsPath;
        this.contextValue = 'fileItem'; // Used for context menus
    }
}

