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
  createFolderStructure: (data) => ipcRenderer.invoke('create-folder-structure', data)
});