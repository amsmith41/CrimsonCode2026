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
const root = (folders as vscode.WorkspaceFolder[])[0].uri.path;

export function convertFileToFileContent(inputFile: filter.FileFolder, relativeLocation: string[]): FileContent | undefined {
    if(inputFile.type === "file") {
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