# CrimsonCode2026

## Project Description:
Code collaboratively offline over different operating systems (Linux and Windows) through the use of Bluetooth Serial Port Profile (SPP).
The host starts a session and generates a tree representing their file directory. The host is able to select which files... Filter files... (see whiteboard posted on discord)

The client joins the session through SPP. Host is able to send their tree to the client and the client is able to receive the tree... select tree.. filter tree..
After making modifications, the client is able to send the tree back to the host. Host is able to receive the tree from the client.
Host sends digest... client check/verifies digest...
client requests files.. host receives files.. and vice versa
Both are able to edit events

# CrimsonCode2026 Theme: Reinventing the Wheel
 - Putting a unique twist on a proven concept
 - Trying new things is at the heart of innovation
 - This could mean putting your own spice into a program or concept your team is familiar with
 - Or coming up with a completely new approach to a problem

   Our project is a blend of several different concepts. We took a inspiration from a Microsoft extension for VS code, Microsoft Live Share, and made a windows exclusive extension cross-platform (Linux and Windows compatible).
   Additionally, this project is not limited to host only contribution as Microsoft Live Share is, a client connected to the host does not need to follow the host around the codebase. The client is free to make changes to a filespace
   that has been shared by the host.
   With nods to GitHub, there is live synchronous collaboration, except completely offline. No internet connection required.
   This offline collaboration is achieved through a Bluetooth Serial Port Profile.
   *VS Code Extension, Microsoft Live Share, GitHub File Collaboration, Bluetooth Serial Port Profile*

   Problems solved:
    - Offline virtualized file sharing
    - Different OS VS code synchronized collaboration

## Project Use Cases
 - Prolonged internet outage
 - Secure Facility off grid file transmission
 - Optimization of work hours (plane + coworkers = code collaboration potential)
 - Stranded on mountain with coworkers

## Naming Conventions
except for auto-generated files with required conventions:
 - camelCase for functions/methods and variable names
 - snake_case for files and directories
