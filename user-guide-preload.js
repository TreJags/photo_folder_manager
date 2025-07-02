const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Load User Guide content
  loadUserGuide: () => ipcRenderer.invoke('load-user-guide-content')
});