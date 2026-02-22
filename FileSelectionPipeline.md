# File Selection Pipeline

## The goals of this pipeline is to use jsons to select the files that need to be shared over the network
On extension start, the Json creater reads the project's file system and turns it into a base json.  The json is then read by the display tree.  Editing the display tree edits only the selected field of the jsons.  When the user clicks host, the base json is filtered to only include selected files, selected folders, and folders containing selected files, creating the Host json.  That json is sent to the client.  The client feeds the host json into the display tree.  They can then edit the host json and decide which files and folders they want to sync and create the Client file.  Then, that client file is sent to the host.

Create Base Json -> Edit Base json with Tree Menu -> Transform Base json into Host json -> Host sends Host Json to Client and discards it -> Edit Host Json with Tree Menu -> Transform Host Json into Client Json -> Cleint sends Client Json to host and discards it -> Host reads the json and sends the required files to the client -> Client sends the differences in their files to the host as an edit.

## example json formatting
```
{
    "files": [
        {
            "name": "example_file",
            "type": "file",
            "children": [],
            "selected": false
        },
        {
            "name": "example_folder",
            "type": "folder",
            "children": [
                {
                    "name": "nested_file",
                    "type": "file",
                    "selected": false
                }
            ],
            "selected": false
        },
        {
            "name": "example_file_2",
            "type": "file",
            "children": [],
            "selected": false
        }
    ]
}
```
