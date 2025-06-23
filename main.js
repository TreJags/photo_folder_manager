const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

// Initialize the store for saving application settings
const store = new Store({
  name: 'photo-folder-tool-settings',
  defaults: {
    lastUsedStructure: null,
    savedStructures: []
  }
});

// Create the main application window
function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    title: 'JTK Labs Photo Dir Manager',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Uncomment for debugging
  // win.webContents.openDevTools();
}

// Create window when app is ready
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for communication with renderer process
// Select directory handler
ipcMain.handle('select-directory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (canceled) {
    return null;
  }

  return filePaths[0];
});

// Save folder structure handler
ipcMain.handle('save-structure', (event, { name, structure }) => {
  const savedStructures = store.get('savedStructures');
  const existingIndex = savedStructures.findIndex(s => s.name === name);

  if (existingIndex >= 0) {
    savedStructures[existingIndex] = { name, structure };
  } else {
    savedStructures.push({ name, structure });
  }

  store.set('savedStructures', savedStructures);
  store.set('lastUsedStructure', name);

  return { success: true };
});

// Get saved structures handler
ipcMain.handle('get-saved-structures', () => {
  return {
    structures: store.get('savedStructures'),
    lastUsed: store.get('lastUsedStructure')
  };
});

// Create folder structure handler
ipcMain.handle('create-folder-structure', async (event, { basePath, structure }) => {
  try {
    await createFolderStructure(basePath, structure);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Recursive function to create folder structure
async function createFolderStructure(basePath, structure) {
  for (const folder of structure) {
    const folderPath = path.join(basePath, folder.name);

    // Create the folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Create subfolders if they exist
    if (folder.children && folder.children.length > 0) {
      await createFolderStructure(folderPath, folder.children);
    }
  }
}
