const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Directory selection
  selectDirectory: () => ipcRenderer.invoke('select-directory'),

  // Structure management
  saveStructure: (data) => ipcRenderer.invoke('save-structure', data),
  getSavedStructures: () => ipcRenderer.invoke('get-saved-structures'),

  // Folder creation
  createFolderStructure: (data) => ipcRenderer.invoke('create-folder-structure', data),

  // ORF file copying
  copyMatchingOrfFiles: (data) => ipcRenderer.invoke('copy-matching-orf-files', data),

  // Progress updates
  onCopyProgress: (callback) => ipcRenderer.on('copy-progress', (_, data) => callback(data)),

  // Base directory management
  saveBaseDirectory: (directory) => ipcRenderer.invoke('save-base-directory', directory),
  getLastBaseDirectory: () => ipcRenderer.invoke('get-last-base-directory'),

  // About dialog
  onShowAbout: (callback) => ipcRenderer.on('show-about', () => callback())
});
