# CrimsonCode2026

## Project Description:
Code collaboratively offline over different operating systems (Linux and Windows) through the use of Bluetooth Serial Port Profile (SPP).
The host starts a session and generates a tree representing their file directory. The host is able to select which files... Filter files... (see whiteboard posted on discord)

The client joins the session through SPP. Host is able to send their tree to the client and the client is able to receive the tree... select tree.. filter tree..
After making modifications, the client is able to send the tree back to the host. Host is able to receive the tree from the client.
Host sends digest... client check/verifies digest...
client requests files.. host receives files.. and vice versa
Both are able to edit events


## Naming Conventions
except for auto-generated files with required conventions:
 - camelCase for functions/methods and variable names
 - snake_case for files and directories
