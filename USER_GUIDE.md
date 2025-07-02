# JTK Labs Photo Dir Manager - User Guide

## Introduction

JTK Labs Photo Dir Manager is a desktop application designed for photographers to efficiently organize their photo files. This user guide will help you understand how to use the application to create standardized folder structures and synchronize RAW files with selected JPG images.

## Installation

### System Requirements
- Windows operating system
- 4GB RAM (minimum)
- 100MB free disk space for the application

### Installation Methods

#### Method 1: Using the Pre-built Executable
1. Download the latest release from the repository
2. Double-click the `JTK_Labs_Photo_Dir_Manager.bat` file in the project directory
3. This will launch the application directly without needing to use the command line

#### Method 2: Running from Source (Recommended for Latest Features)
1. Make sure you have [Node.js](https://nodejs.org/) installed (version 14 or higher recommended)
2. Clone or download the repository
3. Open a command prompt in the project directory
4. Install dependencies by running: `npm install`
5. Double-click the `Run_From_Source.bat` file in the project directory
6. This will run the application using the latest source code, including all recently added features

## Getting Started

When you first open the application, you'll see a tabbed interface with three main tabs:
- **Folder Structure**: For creating and managing folder structures
- **File Cleanup**: For organizing and cleaning up your photo files
- **Sync RAW Files**: For synchronizing RAW files with selected JPG images

### Default Folder Structure

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

This structure is designed for a typical photography workflow where:
- JPG files are sorted into Select, NoSelect, and DeSelect folders
- Selected JPGs may be further processed in NR (Noise Reduction) and Signed folders
- ORF (RAW) files are stored separately
- Matching RAW files for selected JPGs are copied to the syncRAW folder

## Using the Folder Structure Tab

### Creating a New Folder Structure

1. Click the "New Structure" button to start a new structure
2. Enter a name for your structure in the "Structure Name" field
3. Click the "Add Folder" button to add a top-level folder
4. In the dialog that appears, enter a name for the folder and click "Create"
5. The folder will appear in the structure tree view

### Adding Subfolders

1. Click the "Add Subfolder" button next to an existing folder
2. In the dialog that appears, enter a name for the subfolder and click "Create"
3. The subfolder will appear nested under the parent folder in the tree view

### Deleting Folders

1. Click the "Delete" button next to the folder you want to remove
2. The folder and all its subfolders will be removed from the structure

### Saving a Folder Structure

1. Enter a name for your structure in the "Structure Name" field
2. Click the "Save Structure" button
3. Your structure will be saved and will appear in the dropdown menu for future use

### Loading a Saved Structure

1. Select a structure from the dropdown menu
2. The structure will be loaded into the editor

### Creating Folders on Disk

1. Design your folder structure using the editor
2. Click the "Browse..." button next to "Target Directory"
3. Select a directory where you want to create the folder structure
   - The selected Target Directory will be remembered for future sessions
   - It will also be automatically set as the Base Directory in the File Cleanup and Sync RAW Files tabs
4. Click the "Create Folder Structure" button
5. The application will create all folders and subfolders in the selected directory
6. The status bar at the bottom will show a success message when the operation is complete

## Using the File Cleanup Tab

The File Cleanup tab helps you organize and clean up your photo files by providing a simple interface to move files between directories.

### Setting Up Directories

1. Click the "Browse..." button next to "Base Directory"
2. Select the root directory containing your photo folders
3. The application will automatically set the following default locations:
   - **From Location**: `jpg`
   - **To Location**: `jpg\NoSelect`
4. You can change these locations by clicking the "Browse..." buttons next to each field

### Customizing Locations

1. To change the From Location, click the "Browse..." button next to "From Location"
2. Select the directory containing the files you want to move
3. To change the To Location, click the "Browse..." button next to "To Location"
4. Select the directory where you want to move the files
5. The application will display the selected locations as relative paths if they are subdirectories of the Base Directory

### Cleaning Up Files

1. After setting up the directories, click the "Cleanup Files" button
2. The application will move files (but not directories) from the From Location to the To Location
   - Directories in the From Location will be left in place
   - Only files will be moved to the To Location
3. A progress bar will show the status of the operation
4. When complete, the results will show:
   - Number of files successfully moved
   - Number of files that failed to move
   - Detailed error information if any issues occurred

## Using the Sync RAW Files Tab

The Sync RAW Files tab helps you synchronize your RAW files with selected JPG images. This is particularly useful when you've selected specific JPG files for editing and want to work with their corresponding RAW files.

### Setting Up Directories

1. Click the "Browse..." button next to "Base Directory"
2. Select the root directory containing your photo folders
3. The application will automatically set the following subdirectories:
   - **JPG Select Directory**: `[Base Directory]\jpg\Select`
   - **ORF Directory**: `[Base Directory]\orf`
   - **Sync RAW Directory**: `[Base Directory]\syncRAW`

### Synchronizing RAW Files

1. After setting up the directories, click the "Sync RAW Files" button
2. The application will:
   - Scan the JPG Select directory for JPG files
   - Find matching ORF (RAW) files in the ORF directory
   - Copy matching ORF files to the Sync RAW directory
3. A progress bar will show the status of the operation
4. When complete, the results will show:
   - Number of files successfully copied
   - Number of files that failed to copy
   - Detailed error information if any issues occurred

## Tips and Best Practices

### Organizing Your Photos

1. **Consistent Naming**: Use consistent naming conventions for your JPG and RAW files to ensure proper matching
2. **Regular Backups**: Always back up your original files before performing any operations
3. **Structure Planning**: Plan your folder structure based on your workflow before creating it

### Efficient Workflow

1. **Select First**: Sort your JPG files into the Select folder before running the sync operation
2. **Batch Processing**: Process multiple photos at once by selecting them all before syncing
3. **Custom Structures**: Create different folder structures for different types of photography projects
4. **Directory Path Tooltips**: Hover over any directory path input field to see the full path in a tooltip, which is helpful for long paths that don't fit in the input field

## Troubleshooting

### Common Issues and Solutions

#### Application Won't Start

- Make sure you have the correct version of Node.js installed
- Try running as administrator
- Check that all dependencies are installed by running `npm install`

#### Folders Not Creating

- Ensure you have write permissions for the target directory
- Check if the directory path is too long (Windows has path length limitations)
- Make sure the directory doesn't already contain folders with the same names

#### RAW Files Not Syncing

- Verify that your JPG and RAW files have matching base names
- Check that the directory paths are correctly set
- Ensure the ORF directory contains your RAW files

#### Error Messages

- "Access Denied": Run the application as administrator
- "File Not Found": Check that the file paths are correct
- "Disk Full": Ensure you have enough disk space for the operation

The application includes robust error handling to prevent crashes:
- If a directory cannot be accessed, the operation will continue with other directories
- If a file cannot be moved or copied, the application will log the error and continue with other files
- Detailed error information is displayed in the results section of each operation

## Keyboard Shortcuts

- **Ctrl+N**: Create a new structure
- **Ctrl+S**: Save the current structure
- **Ctrl+O**: Open the directory selection dialog
- **F1**: Open this user guide

## Getting Help

If you encounter any issues not covered in this guide, please:
1. Check the repository for updates or known issues
2. Submit an issue on the repository page with details about your problem
3. Include any error messages and steps to reproduce the issue

## Conclusion

JTK Labs Photo Dir Manager is designed to streamline your photography workflow by helping you organize your files efficiently. By following this guide, you should be able to create custom folder structures and synchronize your RAW files with ease.

Happy organizing!
