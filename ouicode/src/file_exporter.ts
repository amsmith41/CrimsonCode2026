import fs from 'fs';
import * as filter from './file_filter';
import * as path from 'path';
import * as vscode from 'vscode';
//import { FileCoverage } from 'vscode';

export interface FileContent {
    name: string,
    location: string[], // an array of directory names, no slashes
    content: string
}

const folders = vscode.workspace.workspaceFolders;
// Use the first workspace folder as root
const root = (folders as vscode.WorkspaceFolder[])[0].uri.fsPath;

export function convertFileToFileContent(inputFile: filter.FileFolder, relativeLocation: string[]): FileContent | undefined {
    if (inputFile.type === "file") {
        try {
            let buffer: Buffer = fs.readFileSync(path.join(root,...relativeLocation,inputFile.name));

            let output: FileContent = {
                name: inputFile.name,
                location: [...relativeLocation],
                content: buffer.toString("base64")
            };
            return output;
        } catch (err) {
            console.log(`convertFile error: ${err}`);
            return undefined;
        }
    }
    // else
    console.log(`attempted to read non-file ${inputFile.name}`);
    return undefined;
}

// Accepts FileContent object. Creates all necessary directories and then places the file
export function convertFileContentToFile(inputContent: FileContent) {
    let location:string = path.join(root,...inputContent.location);
    fs.mkdirSync(location, {recursive: true});
    const buffer: Buffer = Buffer.from(inputContent.content, "base64");
    fs.writeFileSync(path.join(location, inputContent.name), buffer);
}


// This is a recurive function that traverses the file tree records all files in a FileList
// A FileList is in the format [{filter.fileFolder, string[]}, {filter.fileFolder, string[]}, ...]
export function treeToFileList(tree: filter.FileFolderList) {
    // This is the output list
    let outputList: { file: filter.FileFolder, relativeLocation: string[] }[] = [];
    // We need to recursively traverse the file tree and return a {filter.FileFolder, string[]} object for each file.
    tree.files.forEach((item) => {
        // We need to recursively traverse the file tree and return a {filter.FileFolder, string[]} object for each file.
        // The string[] is the relative path to the file, which is built up as we traverse the tree
        var result: { file: filter.FileFolder, relativeLocation: string[] }[] = treeToFileListHelper(item, []);
        outputList.push(...(Array.isArray(result) ? result : [result]));
    });
    return outputList;
}
function treeToFileListHelper(file: filter.FileFolder, currentLocation: string[]): { file: filter.FileFolder, relativeLocation: string[] }[] {
    switch (file.type) {
        case "file":
            return [{ file: file, relativeLocation: currentLocation }];
        case "folder":
            let output: { file: filter.FileFolder, relativeLocation: string[] }[] = [];
            file.children.forEach((item) => {
                var result: { file: filter.FileFolder, relativeLocation: string[] }[] = treeToFileListHelper(item, [...currentLocation, file.name]);
                output.push(...result);
            });
            return output;
    }
}
export function treeToFileContentList(tree: filter.FileFolderList) {
    let input = treeToFileList(tree);
    let output: FileContent[] = [];
    input.forEach((item) => {
        var result: FileContent | undefined = convertFileToFileContent(item.file, item.relativeLocation);
        if (result !== undefined) {
            output.push(result);
        }
    });
    return output;
}

/*
let testContent: FileContent | undefined = convertFileToFileContent(
    {
    name:"file_exporter.ts",
    selected: true,
    children: [],
    type: "file"
    },
    ["src"]);
if(testContent !== undefined) {
    testContent.location.push("copytest");
    convertFileContentToFile(testContent);
} else {
    console.log("fail");
}
//*/