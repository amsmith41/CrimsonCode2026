import * as vscode from 'vscode';
import * as filter from './file_filter';
import * as exporter from './file_exporter';
//import * as blue from 'blue.ts';
//import * as liveEdits from 'live_edits.ts';

export async function beginServerSession(context: vscode.ExtensionContext, activeTree:filter.FileFolderList) {
    /*
    blue.activateServer();
    blue.setConnectCallback((connection: Session) => {
        liveEdits.config(context, activeTree);
        connection.send(activeTree);
        let files: FileContent[] = exporter.treeToFileContentList();
        files.forEach((item: FileContent)) {
            connection.send(item);
        }
        connection.send({status: "live"});
        connection.onReceive((data as liveEdits.edit) => {
            liveEdits.apply(data);
        })
        liveEdits.onEdit((data: liveEdits.edit) => {
            connection.send(data);
        })
    });
    
    //*/
}

export async function beginClientSession(context: vscode.ExtensionContext) {
    let state: "receiveTree" | "receiveFiles" | "liveSession";
    let receivedTree: filter.FileFolderList;
    /*
    blue.connectToServer();
    blue.setConnectCallback((connection: Session) => {
        connection.onReceive((data: any) => {
            switch(state) {
                case "receiveTree":
                    receivedTree = (data as filter.FileFolderList);
                    liveEdits.config(context, receivedTree);
                    state = "receiveFiles";
                    break;
                case "receiveFiles":
                    if("status" in data) {
                        state = "liveSession";
                        liveEdits.onEdit((data: liveEdits.Edit) => {
                            connection.send(data);
                        });
                        break;
                    };
                    exporter.convertFileContentToFile((data as FileContent));
                    break;
                case "liveSession":
                    liveEdits.apply((data as liveEdits.edit));
                break;
            }

        })  
    })
    //*/
}