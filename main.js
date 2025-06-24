const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const { promisify } = require('util');
const os = require('os');

// Disable GPU cache to prevent "Access is denied" errors
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');

// Set a custom directory for HTTP cache to prevent "Access is denied" errors
const userDataPath = app.getPath('userData');
const cachePath = path.join(userDataPath, 'Cache');

// Ensure the cache directory exists
if (!fs.existsSync(cachePath)) {
  fs.mkdirSync(cachePath, { recursive: true });
}

app.commandLine.appendSwitch('disk-cache-dir', cachePath);

// Initialize the store for saving application settings
const store = new Store({
  name: 'photo-folder-tool-settings',
  defaults: {
    lastUsedStructure: null,
    savedStructures: [],
    lastBaseDirectory: null
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

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: async () => {
            const mainWindow = BrowserWindow.getFocusedWindow();
            if (mainWindow) {
              mainWindow.webContents.send('show-about');
            }
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Create window when app is ready
app.whenReady().then(() => {
  createWindow();
  createMenu();

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

// Save base directory handler
ipcMain.handle('save-base-directory', (event, directory) => {
  store.set('lastBaseDirectory', directory);
  return { success: true };
});

// Get last base directory handler
ipcMain.handle('get-last-base-directory', () => {
  return {
    lastBaseDirectory: store.get('lastBaseDirectory')
  };
});

// Copy matching ORF files based on JPG files in Select directory
ipcMain.handle('copy-matching-orf-files', async (event, { baseDir, jpgSelectDir, orfDir, syncRawDir }) => {
  try {
    // Promisify fs functions
    const readdir = promisify(fs.readdir);
    const copyFile = promisify(fs.copyFile);

    // Create syncRAW directory if it doesn't exist
    if (!fs.existsSync(syncRawDir)) {
      fs.mkdirSync(syncRawDir, { recursive: true });
    }

    // Get all JPG files from the Select directory
    const jpgDirFiles = await readdir(jpgSelectDir);
    const jpgFiles = jpgDirFiles.filter(file => file.toLowerCase().endsWith('.jpg'));

    // Get all ORF files from the ORF directory for case-insensitive matching
    const orfDirFiles = await readdir(orfDir);

    // Track success and failures
    const results = {
      success: true,
      copied: 0,
      failed: 0,
      errors: [],
      total: jpgFiles.length,
      completed: 0
    };

    // Send initial progress update
    event.sender.send('copy-progress', {
      ...results,
      currentFile: '',
      status: 'starting'
    });

    // Process each JPG file
    for (const jpgFile of jpgFiles) {
      // Get the base name without extension using path.parse
      const baseName = path.parse(jpgFile).name;

      // Send progress update for current file
      event.sender.send('copy-progress', {
        ...results,
        currentFile: jpgFile,
        status: 'processing'
      });

      // Find the matching ORF file with case-insensitive comparison
      const matchingOrfFile = orfDirFiles.find(file => 
        path.parse(file).name.toLowerCase() === baseName.toLowerCase() && 
        file.toLowerCase().endsWith('.orf')
      );

      // If a matching ORF file is found
      if (matchingOrfFile) {
        const orfFilePath = path.join(orfDir, matchingOrfFile);
        try {
          // Copy the ORF file to the syncRAW directory
          await copyFile(orfFilePath, path.join(syncRawDir, matchingOrfFile));
          results.copied++;

          // Send progress update for successful copy
          event.sender.send('copy-progress', {
            ...results,
            currentFile: matchingOrfFile,
            status: 'copied'
          });
        } catch (error) {
          results.failed++;
          results.errors.push(`Failed to copy ${matchingOrfFile}: ${error.message}`);

          // Send progress update for failed copy
          event.sender.send('copy-progress', {
            ...results,
            currentFile: matchingOrfFile,
            status: 'error',
            error: error.message
          });
        }
      } else {
        results.failed++;
        results.errors.push(`ORF file not found for: ${baseName}.orf`);

        // Send progress update for missing file
        event.sender.send('copy-progress', {
          ...results,
          currentFile: `${baseName}.orf`,
          status: 'notfound'
        });
      }

      // Update completed count
      results.completed++;
    }

    // Send final progress update
    event.sender.send('copy-progress', {
      ...results,
      status: 'completed'
    });

    return results;
  } catch (error) {
    // Send error progress update
    event.sender.send('copy-progress', {
      success: false,
      error: error.message,
      status: 'error'
    });

    return {
      success: false,
      error: error.message
    };
  }
});
