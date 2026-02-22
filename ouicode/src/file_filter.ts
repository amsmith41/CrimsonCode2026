export interface FileFolderList {
    files: FileFolder[]
}

export interface FileFolder {
    name: string,
    selected: boolean,
    type: "file" | "folder",
    children: FileFolder[]
}

// Filter out all items in the file list that are not selected, but keep the deselected ones that
//  have selected children
export function filterJsonFileList(fileList: FileFolderList): FileFolderList {
    let outputFileList: FileFolderList = {
        files: []
    };

    fileList.files.forEach((item)=>{
        var result: FileFolder | undefined = filterJsonFileListHelper(item);
        if(result !== undefined) {
            outputFileList.files.push(result);
        }
    });

    return outputFileList;
}

// If a file is not selected, undefined is returned. If a file is selected, it is returned.
// If a folder is selected, it (and all contents) are returned.
// If a folder is not selected, this function is called recursively on its direct children
function filterJsonFileListHelper(file: FileFolder): FileFolder | undefined {

    let outputFile = {...file};
    outputFile.children = []; // Clear existing children so selected children may be added

    switch(file.type) {
        case 'file':
            if(file.selected) {
                return file;
            } else {
                return undefined;
            }
        case 'folder':
            if(file.selected) {
                return file;
            } else {
                var hasSelectedChildren: boolean = false;
                file.children.forEach((item: FileFolder) => { // Recursively scan children for selected child
                    var result: FileFolder | undefined = filterJsonFileListHelper(item);
                    if (result !== undefined) {
                        hasSelectedChildren = true;
                        outputFile.children.push(result);
                    }
                });
                if(hasSelectedChildren) {
                    return outputFile;
                } else {
                    return undefined;
                }
            }
        break;
    }
    // Return a selected file, or nothing if file is not selected
}
