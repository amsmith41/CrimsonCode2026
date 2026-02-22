import * as fs from 'fs'
import * as vscode from 'vscode';
import * as path from 'path'

export class SharedFileProvider implements vscode.TreeDataProvider<FileItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined> = new vscode.EventEmitter<FileItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<FileItem | undefined> = this._onDidChangeTreeData.event;
    private tree: any = null;

    constructor(private workspaceRoot: string | undefined, private context: vscode.ExtensionContext) {
        this.loadTree("HostFiles.json");
    }
    // Load the file tree from the JSON file in the workspace. If the file doesn't exist, initialize an empty tree.
    private loadTree(fileName: string) {
        if (!this.workspaceRoot) {
            this.tree = { files: [] };
            return;
        }
        // Can we change the name of SharedFiles?
        const jsonPath = path.join(this.workspaceRoot, 'SharedFileJsons', fileName);
        if (fs.existsSync(jsonPath)) {
            try {
                this.tree = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                this.setPaths(this.tree.files, this.workspaceRoot);
            } catch (err) {
                console.error('Error loading file tree:', err);
                this.tree = { files: [] };
            }
        } else {
            this.tree = { files: [] };
        }
    }
    // Recursively set the full file system path for each node in the tree based on its name and parent path
    private setPaths(nodes: any[], parentPath: string) {
        for (const node of nodes) {
            node.path = path.join(parentPath, node.name);
            if (node.children) {
                this.setPaths(node.children, node.path);
            }
        }
    }
    // Save the current tree state back to the JSON file, removing any non-essential properties
    // Since we are not saving rn, don't call this anyware
    private saveJson(jsonName: string) {
        if (!this.workspaceRoot) return;
        const jsonPath = path.join(this.workspaceRoot, 'SharedFileJsons', jsonName);
        try {
            const cleanTree = { files: JSON.parse(JSON.stringify(this.tree.files)) };
            this.cleanTree(cleanTree.files);
            fs.writeFileSync(jsonPath, JSON.stringify(cleanTree, null, 2));
        } catch (err) {
            console.error('Error saving file tree:', err);
        }
    }
    // Recursively remove properties that are not needed in the JSON file
    private cleanTree(nodes: any[]) {
        for (const node of nodes) {
            delete node.path;
            if (node.children) {
                this.cleanTree(node.children);
            }
        }
    }
    // Refresh the TreeView by reloading the tree data and firing the change event
    refresh(fileName: string): void {
        this.loadTree(fileName);
        this._onDidChangeTreeData.fire(undefined);
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
        let jsonFolder: string = "SharedJsonFiles"
        const node = this.findNode(this.tree, item.fsPath);
        if (!node) return;

        const selected = state === vscode.TreeItemCheckboxState.Checked;
        this.updateNodeSelected(node, selected);

        // Update globalState
        const sharedFiles: string[] = this.context.globalState.get(jsonFolder, []);
        const filesToModify = this.getAllFilesFromNode(node);
        let newSharedFiles = sharedFiles.filter(f => !filesToModify.includes(f));
        if (selected) {
            newSharedFiles = [...newSharedFiles, ...filesToModify.filter(f => !newSharedFiles.includes(f))];
        }
        await this.context.globalState.update(jsonFolder, newSharedFiles);

        this.saveJson(jsonFolder === "SharedJsonFiles" ? "HostFiles.json" : "ClientFiles.json");
        this.refresh(jsonFolder === "SharedJsonFiles" ? "HostFiles.json" : "ClientFiles.json");
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

