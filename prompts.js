/**
 * prompts.js
 * 
 * This file contains all the prompts (user-facing text) used in the application.
 * Centralizing these prompts makes it easier to maintain, update, or translate them.
 */

const prompts = {
    // Status Messages
    status: {
        ready: 'Ready',
        userGuideOpened: 'User Guide opened',
        licenseFileOpened: 'License file opened',
        licenseDialogOpened: 'License dialog opened',
        structuresLoaded: 'Structures loaded',
        aboutDialogOpened: 'About dialog opened',
        createdNewStructure: 'Created new structure',
        syncingRawFiles: 'Syncing RAW files...',
        loadedLastBaseDirectory: (dir) => `Loaded last base directory: ${dir}`,
        switchedToTab: (tab) => `Switched to ${tab} tab`,
        loadedStructure: (name) => `Loaded structure: ${name}`,
        structureSaved: (name) => `Structure "${name}" saved`,
        structureDeleted: (name) => `Structure "${name}" deleted`,
        selectedDirectory: (dir) => `Selected directory: ${dir}`,
        folderStructureCreated: (dir) => `Folder structure created in ${dir}`,
        selectedBaseDirectory: (dir) => `Selected base directory: ${dir}`,
        syncCompleted: (copied, failed) => `Sync completed: ${copied} files copied, ${failed} failed`
    },

    // Error Messages
    errors: {
        errorOpeningUserGuide: (error) => `Error opening User Guide: ${error}`,
        errorOpeningLicenseFile: (error) => `Error opening License file: ${error}`,
        errorLoadingBaseDirectory: (error) => `Error loading last base directory: ${error}`,
        errorLoadingStructures: (error) => `Error loading structures: ${error}`,
        pleaseEnterStructureName: 'Please enter a structure name',
        errorSavingStructure: (error) => `Error saving structure: ${error}`,
        pleaseSelectStructureToDelete: 'Please select a structure to delete',
        errorDeletingStructure: (error) => `Error deleting structure: ${error}`,
        errorSelectingDirectory: (error) => `Error selecting directory: ${error}`,
        pleaseSelectTargetDirectory: 'Please select a target directory first',
        pleaseCreateFolderStructure: 'Please create a folder structure first',
        errorCreatingFolders: (error) => `Error creating folders: ${error}`,
        pleaseSelectBaseDirectory: 'Please select a base directory first',
        syncFailed: (error) => `Sync failed: ${error}`,
        errorSyncingFiles: (error) => `Error syncing files: ${error}`
    },

    // Dialog Titles
    dialogTitles: {
        newFolder: 'New Folder',
        about: 'About JTK Labs Photo Dir Manager',
        license: 'End User License Agreement',
        userGuide: 'JTK Labs Photo Dir Manager - User Guide',
        errorDetails: 'Error Details:'
    },

    // Button Labels
    buttons: {
        userGuide: 'User Guide',
        license: 'License',
        newStructure: 'New Structure',
        saveStructure: 'Save Structure',
        deleteStructure: 'Delete Structure',
        browse: 'Browse...',
        createFolderStructure: 'Create Folder Structure',
        addFolder: 'Add Folder',
        addSubfolder: 'Add Subfolder',
        delete: 'Delete',
        cancel: 'Cancel',
        create: 'Create',
        close: 'Close',
        viewLicenseFile: 'View License File',
        syncRawFiles: 'Sync RAW Files'
    },

    // Placeholder Text
    placeholders: {
        selectDirectory: 'Select a directory...',
        structureName: 'Structure Name',
        selectBaseDirectory: 'Select base directory...',
        folderName: 'Folder Name'
    },

    // Other UI Text
    ui: {
        noSyncOperation: 'No sync operation has been performed yet.',
        preparingToCopyFiles: 'Preparing to copy files...',
        loadingUserGuide: 'Loading user guide...',
        startingFileSync: 'Starting file sync...',
        processingFiles: 'Processing files...',
        fileSyncCompleted: 'File sync completed',
        errorDuringFileSync: 'Error during file sync',
        processing: (file) => `Processing: ${file}`,
        copied: (file) => `Copied: ${file}`,
        errorCopying: (file) => `Error copying: ${file}`,
        notFound: (file) => `Not found: ${file}`,
        copiedCount: (count) => `Copied: ${count}`,
        failedCount: (count) => `Failed: ${count}`,
        successfullyCopied: (count) => `Successfully copied ${count} files`,
        noFilesCopied: 'No files were copied',
        filesCopyFailed: (count) => `${count} files failed to copy`
    }
};

module.exports = prompts;