import * as fs from 'fs';
import * as path from 'path';

// Recursively discover files and folders starting from the rootPath.
// This function returns an in-memory tree structure and does NOT perform any disk I/O.
export function discoverFiles(rootPath: string): any {
    function buildTree(dirPath: string): any[] {
        if (!fs.existsSync(dirPath)) return [];
        const stat = fs.statSync(dirPath);
        if (!stat.isDirectory()) return [];

        const items = fs.readdirSync(dirPath);
        const children: any[] = [];
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const itemStat = fs.statSync(fullPath);
            if (itemStat.isDirectory()) {
                const childChildren = buildTree(fullPath);
                children.push({
                    name: item,
                    type: 'folder',
                    children: childChildren,
                    selected: false,
                    path: fullPath
                });
            } else if (itemStat.isFile()) {
                children.push({
                    name: item,
                    type: 'file',
                    children: [],
                    selected: false,
                    path: fullPath
                });
            }
        }
        return children;
    }

    const children = buildTree(rootPath);
    return { files: children };
}