const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
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

// Disable Autofill to prevent DevTools errors
app.commandLine.appendSwitch('disable-features', 'AutofillServerCommunication,Autofill');

// Initialize the store for saving application settings
const store = new Store({
  name: 'photo-folder-tool-settings',
  defaults: {
    lastUsedStructure: null,
    savedStructures: [],
    lastBaseDirectory: null,
    lastTargetDirectory: null
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
          label: 'User Guide',
          click: async () => {
            const mainWindow = BrowserWindow.getFocusedWindow();
            if (mainWindow) {
              mainWindow.webContents.send('show-user-guide');
            }
          }
        },
        {
          label: 'License',
          click: async () => {
            const mainWindow = BrowserWindow.getFocusedWindow();
            if (mainWindow) {
              mainWindow.webContents.send('show-license');
            }
          }
        },
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
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    if (canceled) {
      return null;
    }

    return filePaths[0];
  } catch (error) {
    console.error('Error selecting directory:', error);
    return null;
  }
});

// Save folder structure handler
ipcMain.handle('save-structure', (event, { name, structure }) => {
  try {
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
  } catch (error) {
    console.error('Error saving structure:', error);
    return { success: false, error: error.message };
  }
});

// Get saved structures handler
ipcMain.handle('get-saved-structures', () => {
  try {
    return {
      structures: store.get('savedStructures'),
      lastUsed: store.get('lastUsedStructure')
    };
  } catch (error) {
    console.error('Error getting saved structures:', error);
    return {
      structures: [],
      lastUsed: null
    };
  }
});

// Create folder structure handler
ipcMain.handle('create-folder-structure', async (event, { basePath, structure }) => {
  try {
    const result = await createFolderStructure(basePath, structure);
    return { 
      success: true,
      created: result.created,
      existing: result.existing
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Recursive function to create folder structure
async function createFolderStructure(basePath, structure) {
  let created = [];
  let existing = [];

  for (const folder of structure) {
    const folderPath = path.join(basePath, folder.name);

    // Create the folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      created.push(folderPath);
    } else {
      existing.push(folderPath);
    }

    // Create subfolders if they exist
    if (folder.children && folder.children.length > 0) {
      const result = await createFolderStructure(folderPath, folder.children);
      created = created.concat(result.created);
      existing = existing.concat(result.existing);
    }
  }

  return { created, existing };
}

// Save base directory handler
ipcMain.handle('save-base-directory', (event, directory) => {
  try {
    store.set('lastBaseDirectory', directory);
    return { success: true };
  } catch (error) {
    console.error('Error saving base directory:', error);
    return { success: false, error: error.message };
  }
});

// Get last base directory handler
ipcMain.handle('get-last-base-directory', () => {
  try {
    return {
      lastBaseDirectory: store.get('lastBaseDirectory')
    };
  } catch (error) {
    console.error('Error getting last base directory:', error);
    return {
      lastBaseDirectory: null
    };
  }
});

// Save target directory handler
ipcMain.handle('save-target-directory', (event, directory) => {
  try {
    store.set('lastTargetDirectory', directory);
    return { success: true };
  } catch (error) {
    console.error('Error saving target directory:', error);
    return { success: false, error: error.message };
  }
});

// Get last target directory handler
ipcMain.handle('get-last-target-directory', () => {
  try {
    return {
      lastTargetDirectory: store.get('lastTargetDirectory')
    };
  } catch (error) {
    console.error('Error getting last target directory:', error);
    return {
      lastTargetDirectory: null
    };
  }
});

// Open user guide
ipcMain.handle('open-user-guide', async () => {
  try {
    const userGuidePath = path.join(__dirname, 'USER_GUIDE.md');

    // Check if the USER_GUIDE.md file exists
    if (!fs.existsSync(userGuidePath)) {
      throw new Error(`User Guide file not found: ${userGuidePath}`);
    }

    await shell.openPath(userGuidePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});


// Open license
ipcMain.handle('open-license', async () => {
  try {
    const licensePath = path.join(__dirname, 'LICENSE');
    await shell.openPath(licensePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Move files (not directories) from one location to another
ipcMain.handle('move-files', async (event, { baseDir, fromDir, toDir }) => {
  try {
    // Promisify fs functions
    const readdir = promisify(fs.readdir);
    const rename = promisify(fs.rename);
    const stat = promisify(fs.stat);

    // Resolve full paths
    const fromDirPath = path.isAbsolute(fromDir) ? fromDir : path.join(baseDir, fromDir);
    const toDirPath = path.isAbsolute(toDir) ? toDir : path.join(baseDir, toDir);

    // Create destination directory if it doesn't exist
    if (!fs.existsSync(toDirPath)) {
      fs.mkdirSync(toDirPath, { recursive: true });
    }

    // Get all items from the source directory
    const items = await readdir(fromDirPath);

    // Track success and failures
    const results = {
      success: true,
      moved: 0,
      failed: 0,
      errors: [],
      total: items.length,
      completed: 0
    };

    // Send initial progress update
    event.sender.send('move-progress', {
      ...results,
      currentFile: '',
      status: 'starting'
    });

    // Process each item
    for (const item of items) {
      const fromPath = path.join(fromDirPath, item);
      const toPath = path.join(toDirPath, item);

      // Send progress update for current item
      event.sender.send('move-progress', {
        ...results,
        currentFile: item,
        status: 'processing'
      });

      try {
        // Check if the item is a file (not a directory)
        const stats = await stat(fromPath);

        if (stats.isFile()) {
          // Move the file to the destination directory
          await rename(fromPath, toPath);
          results.moved++;

          // Send progress update for successful move
          event.sender.send('move-progress', {
            ...results,
            currentFile: item,
            status: 'moved'
          });
        } else {
          // Skip directories
          results.failed++;
          results.errors.push(`Skipped directory: ${item}`);

          // Send progress update for skipped directory
          event.sender.send('move-progress', {
            ...results,
            currentFile: item,
            status: 'skipped',
            error: 'Item is a directory'
          });
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to move ${item}: ${error.message}`);

        // Send progress update for failed move
        event.sender.send('move-progress', {
          ...results,
          currentFile: item,
          status: 'error',
          error: error.message
        });
      }

      // Update completed count
      results.completed++;
    }

    // Send final progress update
    event.sender.send('move-progress', {
      ...results,
      status: 'completed'
    });

    return results;
  } catch (error) {
    // Send error progress update
    event.sender.send('move-progress', {
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
