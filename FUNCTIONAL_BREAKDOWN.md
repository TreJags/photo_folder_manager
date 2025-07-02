# JTK Labs Photo Dir Manager - Functional Breakdown

## Application Overview

JTK Labs Photo Dir Manager is a desktop application designed for photographers to efficiently organize their photo files. It provides tools for creating standardized folder structures and synchronizing RAW files with selected JPG images. The application is built using Electron, allowing it to run as a native desktop application on Windows.

## Architecture

The application follows the Electron architecture with two main processes:

### Main Process (main.js)
- Manages the application lifecycle
- Handles file system operations
- Provides IPC (Inter-Process Communication) handlers for the renderer process
- Manages application settings storage
- Creates the application window and menu

### Renderer Process (renderer directory)
- Implements the user interface
- Handles user interactions
- Communicates with the main process through IPC
- Displays feedback and results to the user

### Bridge (preload.js)
- Provides a secure bridge between the main and renderer processes
- Exposes a limited API to the renderer process
- Prevents direct access to Node.js APIs from the renderer process

## Core Functionalities

### 1. Folder Structure Management
- Create, edit, and save folder structures
- Add folders and subfolders to create hierarchical structures
- Delete folders from the structure
- Save multiple named folder structures for future use
- Load previously saved structures
- Track the last used structure

### 2. Folder Creation
- Select a target directory using a file browser
- Create the defined folder structure on disk
- Provide feedback on the success or failure of folder creation

### 3. RAW File Synchronization
- Select a base directory containing photo folders
- Automatically determine JPG Select, ORF (RAW), and Sync RAW directories
- Find ORF (Olympus Raw Format) files that match the names of JPG files in the Select directory
- Copy matching ORF files to the Sync RAW directory
- Provide real-time progress updates during the sync process
- Display detailed results including success and error counts

### 4. Settings Persistence
- Save and recall folder structures
- Remember the last used structure
- Store the last used base directory
- Persist settings between application sessions

## User Interface Components

### 1. Tabbed Interface
- Folder Structure tab for creating and managing folder structures
- Sync RAW Files tab for synchronizing RAW files with selected JPGs

### 2. Folder Structure Tab
- Structure selection dropdown
- Structure name input
- New/Save/Delete structure buttons
- Target directory selection
- Folder structure tree view
- Add folder/subfolder buttons
- Create folder structure button

### 3. Sync RAW Files Tab
- Base directory selection
- Automatic path determination for JPG Select, ORF, and Sync RAW directories
- Sync RAW Files button
- Progress display with:
  - Progress bar
  - File counts and percentages
  - Current file being processed
  - Success and error counts
  - Detailed error information

### 4. Modals
- New Folder modal for adding folders and subfolders
- About dialog with application information and usage instructions

### 5. Status Bar
- Provides feedback on current operations
- Displays success and error messages

## Data Flow

1. **Folder Structure Creation**:
   - User creates a folder structure in the UI
   - Structure is saved to electron-store via IPC
   - Structure can be loaded from electron-store
   - When creating folders, structure is sent to main process
   - Main process creates folders on disk using Node.js fs module

2. **RAW File Synchronization**:
   - User selects base directory
   - Application determines subdirectories
   - User initiates sync operation
   - Main process reads JPG files from Select directory
   - Main process finds matching ORF files in ORF directory
   - Main process copies matching files to Sync RAW directory
   - Progress updates are sent to renderer process via IPC
   - Final results are displayed in the UI

## Configuration and Settings

The application uses electron-store to persist settings:
- `lastUsedStructure`: Name of the last used folder structure
- `savedStructures`: Array of saved folder structures with names
- `lastBaseDirectory`: Path to the last used base directory

## Dependencies

### Production Dependencies
- **electron-store**: Persistent storage for application settings

### Development Dependencies
- **electron**: Framework for building cross-platform desktop applications
- **electron-builder**: Tool for packaging Electron applications

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

This structure is designed for a typical photography workflow where:
- JPG files are sorted into Select, NoSelect, and DeSelect folders
- Selected JPGs may be further processed in NR (Noise Reduction) and Signed folders
- ORF (RAW) files are stored separately
- Matching RAW files for selected JPGs are copied to the syncRAW folder

## Error Handling

The application includes comprehensive error handling:
- File system operation errors are caught and reported
- User input validation prevents invalid operations
- Progress updates include error information
- Detailed error messages are displayed in the UI
- Status bar provides feedback on all operations

## User Experience Considerations

- Tooltips for directory paths that may be too long to display
- Real-time progress updates during lengthy operations
- Persistent settings to remember user preferences
- Tabbed interface for organizing different functionalities
- Clear visual feedback for success and error states
- Hierarchical tree view for visualizing folder structures