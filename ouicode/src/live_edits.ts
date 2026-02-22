import * as vscode from 'vscode';
import * as path from 'path';
import * as filter from './file_filter';
import { InteractiveRefactorArguments } from 'typescript';

export interface Edit {
    localPath: string,
    range: vscode.Range,
    text: string
}

let editCallback: (a: Edit)=>null = (a:Edit)=> {return null;};
let applyingWorkspaceEdits: boolean = false;
let ourTree: filter.FileFolderList;

export function config(context: vscode.ExtensionContext, workingTree: filter.FileFolderList) {
    ourTree = workingTree;
    vscode.workspace.onDidChangeTextDocument((event) => {
        if(!applyingWorkspaceEdits) {
            event.contentChanges.forEach((change)=>{
                let thisEdit:Edit = {
                    localPath: vscode.workspace.asRelativePath(event.document.uri),
                    range: change.range,
                    text: change.text
                };
                editCallback(thisEdit);
            });
        }
    });
}

export function onEdit(fn: (a:Edit)=>null) {
    editCallback = fn;
}

function relativeToAbsolute(relativePath: string): vscode.Uri | undefined {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) {
        return undefined;
    }

    // Use the first workspace folder
    const root = folders[0].uri;

    return vscode.Uri.joinPath(root, relativePath);
}

export async function apply(change: Edit) {
    const edit = new vscode.WorkspaceEdit();

    await edit.replace(
        (relativeToAbsolute(change.localPath) as vscode.Uri),
        change.range,
        change.text
    );
    applyingWorkspaceEdits = true;
    await vscode.workspace.applyEdit(edit);
    applyingWorkspaceEdits = false;
}
/*
export function beginLiveSession(context: vscode.ExtensionContext) {

vscode.workspace.onDidChangeTextDocument(event => {
    console.log(event);
});
}
*/
