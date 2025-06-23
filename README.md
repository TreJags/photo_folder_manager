# photo_folder_manager
# JTK Labs Photo Dir Manager

A Windows application for creating and managing photo folder structures.

## Features

- Create, edit, and save folder structures
- Select a starting directory using a file browser
- Create folder structures on disk
- Save and recall multiple folder structures
- Automatically remembers the last used structure

## Default Folder Structure

The application comes with a default folder structure:

```
- Jpg
  - Select
    - NR
      - Signed
  - NoSelect
  - DeSelect
- Orf
- syncRAW
```

## Installation

1. Make sure you have [Node.js](https://nodejs.org/) installed (version 14 or higher recommended)
2. Clone or download this repository
3. Open a command prompt in the project directory
4. Install dependencies:

```
npm install
```

## Running the Application

### Development Mode

To run the application in development mode:

```
npm start
```

### Windows Executable

To run the application as a Windows executable:

1. Double-click the `JTK_Labs_Photo_Dir_Manager.bat` file in the project directory
2. This will launch the application directly without needing to use the command line

## Building an Executable

To build a Windows executable:

```
npm run build
```

The executable will be created in the `dist\win-unpacked` directory as `JTK Labs Photo Dir Manager.exe`.

You can also run this executable directly if you prefer not to use the batch file.

## Usage Instructions

1. **Creating a Folder Structure**:
   - Use the "New Structure" button to start a new structure
   - Enter a name for your structure
   - Add folders using the "Add Folder" button
   - Add subfolders by clicking "Add Subfolder" on existing folders
   - Delete folders using the "Delete" button

2. **Saving a Structure**:
   - Enter a name for your structure
   - Click "Save Structure"

3. **Loading a Saved Structure**:
   - Select a structure from the dropdown menu

4. **Creating Folders on Disk**:
   - Select a target directory using the "Browse..." button
   - Click "Create Folder Structure" to create the folders

## Development

This application is built with:

- Electron - For creating cross-platform desktop applications
- Node.js - JavaScript runtime
- HTML/CSS/JavaScript - For the user interface

## License

ISC
