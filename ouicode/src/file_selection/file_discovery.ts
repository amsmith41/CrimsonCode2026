import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

// Recursively discover files and folders starting from the rootPath, marking those that are in sharedFiles as selected
function discoverFiles(rootPath: string, sharedFiles: string[]): any {
    function buildTree(dirPath: string): any {
        if (!fs.existsSync(dirPath)) return [];
        const stat = fs.statSync(dirPath);
        if (!stat.isDirectory()) return [];

        const items = fs.readdirSync(dirPath);
        const children = [];
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const itemStat = fs.statSync(fullPath);
            if (itemStat.isDirectory()) {
                const childChildren = buildTree(fullPath);
                const allChildFiles = getAllFilesFromChildren(childChildren);
                const selected = allChildFiles.every(f => sharedFiles.includes(f));
                children.push({
                    name: item,
                    type: 'folder',
                    children: childChildren,
                    selected: selected
                });
            } else if (itemStat.isFile()) {
                children.push({
                    name: item,
                    type: 'file',
                    children: [],
                    selected: sharedFiles.includes(fullPath)
                });
            }
        }
        return children;
    }

    function getAllFilesFromChildren(children: any[]): string[] {
        const result = [];
        for (const child of children) {
            if (child.type === 'file') {
                result.push(child.path);
            } else {
                result.push(...getAllFilesFromChildren(child.children));
            }
        }
        return result;
    }

    const children = buildTree(rootPath);
    return { files: children };
}
// Save the current tree state back to the JSON file
// If SharedFileJsons doesn't exist, create it and save the tree. If it exists, update it with the current tree state.
// If are the host, then we are saving HostFiles.json, otherwise we return
export function saveFileTree(context: vscode.ExtensionContext, jsonName: string) {
    const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!rootPath) return;

    const sharedFiles: string[] = context.globalState.get('SharedFileJsons', []);

    const sharedFilesFolder = path.join(rootPath, 'SharedFileJsons');
    if (!fs.existsSync(sharedFilesFolder)) {
        fs.mkdirSync(sharedFilesFolder, { recursive: true });
    }

    const jsonPath = path.join(sharedFilesFolder, jsonName);
    const tree = discoverFiles(rootPath, sharedFiles);
    fs.writeFileSync(jsonPath, JSON.stringify(tree, null, 2));
}