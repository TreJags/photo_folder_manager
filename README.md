# photo_folder_manager
# JTK Labs Photo Dir Manager

A Windows application for creating and managing photo folder structures.

## Features

- Create, edit, and save folder structures
- Select a starting directory using a file browser
- Create folder structures on disk
- Save and recall multiple folder structures
- Automatically remembers the last used structure
- Sync RAW files based on selected JPG files

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

### Running from Source (Recommended for Latest Features)

If you're experiencing issues with missing features (like the Sync RAW Files tab), you can run the application directly from source:

1. Double-click the `Run_From_Source.bat` file in the project directory
2. This will run the application using the latest source code, including all recently added features

## Building an Executable

There are two ways to build the application:

### Option 1: Using the Build Script (Recommended)

1. Right-click on the `Build_As_Admin.bat` file in the project directory
2. Select "Run as administrator"
3. The script will automatically check for prerequisites, install dependencies if needed, and build the application

### Option 2: Manual Build

To build a Windows executable that includes all the latest features:

```
npm run build
```

**Note**: Building the application requires administrator privileges on Windows to create symbolic links. If you encounter permission errors during the build process, try running the command prompt as an administrator.

### Build Output

The executable will be created in the `dist\win-unpacked` directory as `JTK Labs Photo Dir Manager.exe`.

You can also run this executable directly if you prefer not to use the batch file.

**Important**: If you're using the pre-built executable and don't see the Sync RAW Files tab, it's likely because the executable was built before this feature was added. Use the `Run_From_Source.bat` file to access all the latest features, or rebuild the application following the instructions above.

### Detailed Build Instructions

For more detailed instructions on building the application, including troubleshooting common issues, see the [BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md) file.

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

5. **Syncing RAW Files**:
   - Click on the "Sync RAW Files" tab at the top of the application
   - Select a base directory using the "Browse..." button
   - The JPG Select, ORF, and Sync RAW directories will be automatically set based on the base directory
   - Click "Sync RAW Files" to copy matching ORF files to the Sync RAW directory
   - The application will find ORF files that match the names of JPG files in the Select directory

## Development

This application is built with:

- Electron - For creating cross-platform desktop applications
- Node.js - JavaScript runtime
- HTML/CSS/JavaScript - For the user interface

## License

ISC
