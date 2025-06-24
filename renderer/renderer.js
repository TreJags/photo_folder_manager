// DOM Elements - Tabs
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// DOM Elements - About Dialog
const aboutModal = document.getElementById('about-modal');
const closeAboutBtn = document.getElementById('close-about');

// DOM Elements - Folder Structure Tab
const structureSelect = document.getElementById('structure-select');
const newStructureBtn = document.getElementById('new-structure-btn');
const saveStructureBtn = document.getElementById('save-structure-btn');
const deleteStructureBtn = document.getElementById('delete-structure-btn');
const directoryPathInput = document.getElementById('directory-path');
const selectDirectoryBtn = document.getElementById('select-directory-btn');
const createFoldersBtn = document.getElementById('create-folders-btn');
const structureNameInput = document.getElementById('structure-name');
const addFolderBtn = document.getElementById('add-folder-btn');
const structureTree = document.getElementById('structure-tree');
const statusBar = document.getElementById('status-bar');
const newFolderModal = document.getElementById('new-folder-modal');
const newFolderNameInput = document.getElementById('new-folder-name');
const cancelNewFolderBtn = document.getElementById('cancel-new-folder');
const confirmNewFolderBtn = document.getElementById('confirm-new-folder');

// DOM Elements - Sync RAW Tab
const syncBaseDirInput = document.getElementById('sync-base-dir');
const selectSyncBaseDirBtn = document.getElementById('select-sync-base-dir-btn');
const jpgSelectDirInput = document.getElementById('jpg-select-dir');
const orfDirInput = document.getElementById('orf-dir');
const syncRawDirInput = document.getElementById('sync-raw-dir');
const syncRawBtn = document.getElementById('sync-raw-btn');
const syncResultsContainer = document.getElementById('sync-results-container');

// State
let currentStructure = [];
let selectedDirectory = null;
let savedStructures = [];
let currentParentFolder = null; // For adding subfolders
let isEditingExistingStructure = false;

// Sync RAW state
let syncBaseDir = null;
let jpgSelectDir = null;
let orfDir = null;
let syncRawDir = null;

// Default structure as specified in requirements
const defaultStructure = [
    {
        name: 'Jpg',
        children: [
            {
                name: 'Select',
                children: [
                    {
                        name: 'NR',
                        children: [
                            {
                                name: 'Signed',
                                children: []
                            }
                        ]
                    }
                ]
            },
            {
                name: 'NoSelect',
                children: []
            },
            {
                name: 'DeSelect',
                children: []
            }
        ]
    },
    {
        name: 'Orf',
        children: []
    },
    {
        name: 'syncRAW',
        children: []
    }
];

// Initialize the application
async function init() {
    await loadSavedStructures();
    await loadLastBaseDirectory();
    renderStructureTree();
    setupEventListeners();
    setupTooltips();
}

// Load the last base directory from storage
async function loadLastBaseDirectory() {
    try {
        const result = await window.api.getLastBaseDirectory();
        if (result.lastBaseDirectory) {
            syncBaseDir = result.lastBaseDirectory;
            syncBaseDirInput.value = syncBaseDir;
            syncBaseDirInput.title = syncBaseDir; // Update tooltip

            // Set default subdirectories based on the batch file structure
            jpgSelectDir = `${syncBaseDir}\\jpg\\Select`;
            orfDir = `${syncBaseDir}\\orf`;
            syncRawDir = `${syncBaseDir}\\syncRAW`;

            // Update the UI
            jpgSelectDirInput.value = jpgSelectDir;
            orfDirInput.value = orfDir;
            syncRawDirInput.value = syncRawDir;

            // Update tooltips
            jpgSelectDirInput.title = jpgSelectDir;
            orfDirInput.title = orfDir;
            syncRawDirInput.title = syncRawDir;

            updateStatus(`Loaded last base directory: ${syncBaseDir}`);
        }
    } catch (error) {
        updateStatus(`Error loading last base directory: ${error.message}`, true);
    }
}

// Load saved structures from storage
async function loadSavedStructures() {
    try {
        const result = await window.api.getSavedStructures();
        savedStructures = result.structures || [];

        // Populate the select dropdown
        structureSelect.innerHTML = '<option value="">-- Select a structure --</option>';
        savedStructures.forEach(structure => {
            const option = document.createElement('option');
            option.value = structure.name;
            option.textContent = structure.name;
            structureSelect.appendChild(option);
        });

        // Load the last used structure if available
        if (result.lastUsed) {
            structureSelect.value = result.lastUsed;
            const structure = savedStructures.find(s => s.name === result.lastUsed);
            if (structure) {
                structureNameInput.value = structure.name;
                currentStructure = structure.structure;
                isEditingExistingStructure = true;
                renderStructureTree();
            }
        } else if (savedStructures.length === 0) {
            // If no structures exist, create the default one
            structureNameInput.value = 'Default Photo Structure';
            currentStructure = JSON.parse(JSON.stringify(defaultStructure)); // Deep clone
            renderStructureTree();
        }

        updateStatus('Structures loaded');
    } catch (error) {
        updateStatus(`Error loading structures: ${error.message}`, true);
    }
}

// Render the structure tree
function renderStructureTree() {
    structureTree.innerHTML = '';

    currentStructure.forEach(folder => {
        const folderElement = createFolderElement(folder);
        structureTree.appendChild(folderElement);
    });
}

// Create a folder element for the tree view
function createFolderElement(folder) {
    const template = document.getElementById('folder-item-template');
    const folderElement = template.content.cloneNode(true).querySelector('.folder-item');

    const folderName = folderElement.querySelector('.folder-name');
    folderName.textContent = folder.name;

    const folderChildren = folderElement.querySelector('.folder-children');

    // Add child folders if they exist
    if (folder.children && folder.children.length > 0) {
        folder.children.forEach(childFolder => {
            const childElement = createFolderElement(childFolder);
            folderChildren.appendChild(childElement);
        });
    }

    // Setup event listeners for this folder
    setupFolderEventListeners(folderElement, folder);

    return folderElement;
}

// Setup event listeners for folder elements
function setupFolderEventListeners(folderElement, folder) {
    const toggle = folderElement.querySelector('.folder-toggle');
    const addSubfolderBtn = folderElement.querySelector('.add-subfolder-btn');
    const deleteFolderBtn = folderElement.querySelector('.delete-folder-btn');

    // Toggle folder expansion
    toggle.addEventListener('click', () => {
        folderElement.classList.toggle('expanded');
    });

    // Add subfolder
    addSubfolderBtn.addEventListener('click', () => {
        currentParentFolder = folder;
        openNewFolderModal();
    });

    // Delete folder
    deleteFolderBtn.addEventListener('click', () => {
        deleteFolder(folder);
        renderStructureTree();
    });
}

// Delete a folder from the structure
function deleteFolder(folderToDelete) {
    // Function to recursively search and delete a folder
    function findAndDelete(folders) {
        for (let i = 0; i < folders.length; i++) {
            if (folders[i] === folderToDelete) {
                folders.splice(i, 1);
                return true;
            }

            if (folders[i].children && folders[i].children.length > 0) {
                if (findAndDelete(folders[i].children)) {
                    return true;
                }
            }
        }
        return false;
    }

    findAndDelete(currentStructure);
}

// Open the new folder modal
function openNewFolderModal() {
    newFolderNameInput.value = '';
    newFolderModal.classList.add('active');
    newFolderNameInput.focus();
}

// Close the new folder modal
function closeNewFolderModal() {
    newFolderModal.classList.remove('active');
}

// Open the About dialog
function openAboutDialog() {
    aboutModal.classList.add('active');
    updateStatus('About dialog opened');
}

// Close the About dialog
function closeAboutDialog() {
    aboutModal.classList.remove('active');
    updateStatus('Ready');
}

// Add a new folder
function addNewFolder(name, parent = null) {
    const newFolder = {
        name: name,
        children: []
    };

    if (parent) {
        parent.children.push(newFolder);
    } else {
        currentStructure.push(newFolder);
    }

    renderStructureTree();
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            const tabId = tab.getAttribute('data-tab');
            tab.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');

            updateStatus(`Switched to ${tab.textContent} tab`);
        });
    });

    // Structure selection
    structureSelect.addEventListener('change', () => {
        const selectedName = structureSelect.value;
        if (selectedName) {
            const structure = savedStructures.find(s => s.name === selectedName);
            if (structure) {
                structureNameInput.value = structure.name;
                currentStructure = structure.structure;
                isEditingExistingStructure = true;
                renderStructureTree();
                updateStatus(`Loaded structure: ${structure.name}`);
            }
        }
    });

    // New structure
    newStructureBtn.addEventListener('click', () => {
        structureNameInput.value = '';
        currentStructure = [];
        isEditingExistingStructure = false;
        renderStructureTree();
        updateStatus('Created new structure');
    });

    // Save structure
    saveStructureBtn.addEventListener('click', async () => {
        const name = structureNameInput.value.trim();
        if (!name) {
            updateStatus('Please enter a structure name', true);
            return;
        }

        try {
            await window.api.saveStructure({
                name: name,
                structure: currentStructure
            });

            await loadSavedStructures(); // Reload the structures
            isEditingExistingStructure = true;
            updateStatus(`Structure "${name}" saved`);
        } catch (error) {
            updateStatus(`Error saving structure: ${error.message}`, true);
        }
    });

    // Delete structure
    deleteStructureBtn.addEventListener('click', async () => {
        const selectedName = structureSelect.value;
        if (!selectedName) {
            updateStatus('Please select a structure to delete', true);
            return;
        }

        // Filter out the structure to delete
        const updatedStructures = savedStructures.filter(s => s.name !== selectedName);

        try {
            // Save the updated list (without the deleted structure)
            await window.api.saveStructure({
                name: 'TEMP_DELETE_OPERATION',
                structure: []
            });

            // Reload structures
            await loadSavedStructures();

            // Reset current structure if it was the deleted one
            if (isEditingExistingStructure && structureNameInput.value === selectedName) {
                structureNameInput.value = '';
                currentStructure = [];
                isEditingExistingStructure = false;
                renderStructureTree();
            }

            updateStatus(`Structure "${selectedName}" deleted`);
        } catch (error) {
            updateStatus(`Error deleting structure: ${error.message}`, true);
        }
    });

    // Select directory
    selectDirectoryBtn.addEventListener('click', async () => {
        try {
            const directory = await window.api.selectDirectory();
            if (directory) {
                selectedDirectory = directory;
                directoryPathInput.value = directory;
                directoryPathInput.title = directory; // Update tooltip
                updateStatus(`Selected directory: ${directory}`);
            }
        } catch (error) {
            updateStatus(`Error selecting directory: ${error.message}`, true);
        }
    });

    // Create folders
    createFoldersBtn.addEventListener('click', async () => {
        if (!selectedDirectory) {
            updateStatus('Please select a target directory first', true);
            return;
        }

        if (currentStructure.length === 0) {
            updateStatus('Please create a folder structure first', true);
            return;
        }

        try {
            const result = await window.api.createFolderStructure({
                basePath: selectedDirectory,
                structure: currentStructure
            });

            if (result.success) {
                updateStatus(`Folder structure created in ${selectedDirectory}`);
            } else {
                updateStatus(`Error creating folders: ${result.error}`, true);
            }
        } catch (error) {
            updateStatus(`Error creating folders: ${error.message}`, true);
        }
    });

    // Add folder
    addFolderBtn.addEventListener('click', () => {
        currentParentFolder = null;
        openNewFolderModal();
    });

    // New folder modal
    confirmNewFolderBtn.addEventListener('click', () => {
        const folderName = newFolderNameInput.value.trim();
        if (folderName) {
            addNewFolder(folderName, currentParentFolder);
            closeNewFolderModal();
        }
    });

    cancelNewFolderBtn.addEventListener('click', () => {
        closeNewFolderModal();
    });

    // Close modal when clicking outside
    newFolderModal.addEventListener('click', (e) => {
        if (e.target === newFolderModal) {
            closeNewFolderModal();
        }
    });

    // Handle Enter key in the new folder input
    newFolderNameInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            confirmNewFolderBtn.click();
        }
    });

    // About dialog
    closeAboutBtn.addEventListener('click', closeAboutDialog);

    // Close About dialog when clicking outside
    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            closeAboutDialog();
        }
    });

    // Listen for show-about event from main process
    window.api.onShowAbout(openAboutDialog);

    // Sync RAW Tab - Select Base Directory
    selectSyncBaseDirBtn.addEventListener('click', async () => {
        try {
            const directory = await window.api.selectDirectory();
            if (directory) {
                syncBaseDir = directory;
                syncBaseDirInput.value = directory;
                syncBaseDirInput.title = directory; // Update tooltip

                // Set default subdirectories based on the batch file structure
                jpgSelectDir = `${directory}\\jpg\\Select`;
                orfDir = `${directory}\\orf`;
                syncRawDir = `${directory}\\syncRAW`;

                // Update the UI
                jpgSelectDirInput.value = jpgSelectDir;
                orfDirInput.value = orfDir;
                syncRawDirInput.value = syncRawDir;

                // Update tooltips
                jpgSelectDirInput.title = jpgSelectDir;
                orfDirInput.title = orfDir;
                syncRawDirInput.title = syncRawDir;

                // Save the base directory for next time
                await window.api.saveBaseDirectory(directory);

                updateStatus(`Selected base directory: ${directory}`);
            }
        } catch (error) {
            updateStatus(`Error selecting directory: ${error.message}`, true);
        }
    });

    // Sync RAW Tab - Sync RAW Files
    syncRawBtn.addEventListener('click', async () => {
        if (!syncBaseDir) {
            updateStatus('Please select a base directory first', true);
            return;
        }

        try {
            updateStatus('Syncing RAW files...');

            // Initialize progress display
            initProgressDisplay();

            // Set up progress listener
            window.api.onCopyProgress(updateProgressDisplay);

            const result = await window.api.copyMatchingOrfFiles({
                baseDir: syncBaseDir,
                jpgSelectDir: jpgSelectDir,
                orfDir: orfDir,
                syncRawDir: syncRawDir
            });

            // Final update will be handled by the progress listener

            if (result.success) {
                updateStatus(`Sync completed: ${result.copied} files copied, ${result.failed} failed`);
            } else {
                updateStatus(`Sync failed: ${result.error}`, true);
            }
        } catch (error) {
            updateStatus(`Error syncing files: ${error.message}`, true);

            // Display error in results container
            syncResultsContainer.innerHTML = `
                <div class="results-error">
                    <p>Error: ${error.message}</p>
                </div>
            `;
        }
    });
}

// Initialize the progress display
function initProgressDisplay() {
    syncResultsContainer.innerHTML = `
        <div class="progress-container">
            <div class="progress-header">
                <p>Initializing file sync...</p>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: 0%"></div>
            </div>
            <div class="progress-stats">
                <span class="progress-count">0 / 0</span>
                <span class="progress-percentage">0%</span>
            </div>
            <div class="progress-current-file">
                <p>Preparing to copy files...</p>
            </div>
            <div class="progress-details">
                <div class="progress-success-count">Copied: 0</div>
                <div class="progress-error-count">Failed: 0</div>
            </div>
        </div>
        <div class="progress-errors"></div>
    `;
}

// Update the progress display based on the progress data
function updateProgressDisplay(progress) {
    // Get elements
    const progressContainer = syncResultsContainer.querySelector('.progress-container');
    const progressHeader = syncResultsContainer.querySelector('.progress-header p');
    const progressBar = syncResultsContainer.querySelector('.progress-bar');
    const progressCount = syncResultsContainer.querySelector('.progress-count');
    const progressPercentage = syncResultsContainer.querySelector('.progress-percentage');
    const progressCurrentFile = syncResultsContainer.querySelector('.progress-current-file p');
    const progressSuccessCount = syncResultsContainer.querySelector('.progress-success-count');
    const progressErrorCount = syncResultsContainer.querySelector('.progress-error-count');
    const progressErrors = syncResultsContainer.querySelector('.progress-errors');

    // Update header based on status
    switch(progress.status) {
        case 'starting':
            progressHeader.textContent = 'Starting file sync...';
            break;
        case 'processing':
            progressHeader.textContent = 'Processing files...';
            break;
        case 'completed':
            progressHeader.textContent = 'File sync completed';
            break;
        case 'error':
            progressHeader.textContent = 'Error during file sync';
            progressHeader.className = 'results-error';
            break;
    }

    // Update progress bar and counts
    if (progress.total > 0) {
        const percent = Math.round((progress.completed / progress.total) * 100);
        progressBar.style.width = `${percent}%`;
        progressCount.textContent = `${progress.completed} / ${progress.total}`;
        progressPercentage.textContent = `${percent}%`;
    }

    // Update current file info
    if (progress.currentFile) {
        switch(progress.status) {
            case 'processing':
                progressCurrentFile.textContent = `Processing: ${progress.currentFile}`;
                break;
            case 'copied':
                progressCurrentFile.textContent = `Copied: ${progress.currentFile}`;
                progressCurrentFile.className = 'results-success';
                break;
            case 'error':
                progressCurrentFile.textContent = `Error copying: ${progress.currentFile}`;
                progressCurrentFile.className = 'results-error';
                break;
            case 'notfound':
                progressCurrentFile.textContent = `Not found: ${progress.currentFile}`;
                progressCurrentFile.className = 'results-error';
                break;
        }
    }

    // Update success and error counts
    progressSuccessCount.textContent = `Copied: ${progress.copied}`;
    progressErrorCount.textContent = `Failed: ${progress.failed}`;

    // Update error details
    if (progress.errors && progress.errors.length > 0) {
        progressErrors.innerHTML = `
            <h3>Error Details:</h3>
            <ul>
                ${progress.errors.map(error => `<li class="results-error">${error}</li>`).join('')}
            </ul>
        `;
    }

    // If completed, display final summary
    if (progress.status === 'completed') {
        displaySyncResults(progress);
    }
}

// Display sync results in the results container
function displaySyncResults(result) {
    // Only replace the content if we're not showing progress updates
    if (!result.status || result.status !== 'completed') {
        syncResultsContainer.innerHTML = '';
    }

    if (!result.success && result.error) {
        // Display error message
        syncResultsContainer.innerHTML = `
            <div class="results-error">
                <p>Error: ${result.error}</p>
            </div>
        `;
        return;
    }

    // If we're showing the final results after progress updates, don't clear the container
    if (!result.status || result.status !== 'completed') {
        // Create summary section
        const summary = document.createElement('div');
        summary.className = 'results-summary';

        if (result.copied > 0) {
            summary.innerHTML = `
                <p class="results-success">Successfully copied ${result.copied} files</p>
            `;
        } else {
            summary.innerHTML = `
                <p>No files were copied</p>
            `;
        }

        if (result.failed > 0) {
            summary.innerHTML += `
                <p class="results-error">${result.failed} files failed to copy</p>
            `;
        }

        syncResultsContainer.appendChild(summary);

        // Create details section if there are errors
        if (result.errors && result.errors.length > 0) {
            const details = document.createElement('div');
            details.className = 'results-details';

            details.innerHTML = `
                <h3>Error Details:</h3>
                <ul>
                    ${result.errors.map(error => `<li class="results-error">${error}</li>`).join('')}
                </ul>
            `;

            syncResultsContainer.appendChild(details);
        }
    }
}

// Update the status bar
function updateStatus(message, isError = false) {
    statusBar.textContent = message;
    statusBar.style.backgroundColor = isError ? '#ffdddd' : '#f9f9f9';
    statusBar.style.color = isError ? '#d32f2f' : '#333';
}

// Setup tooltips for directory path inputs
function setupTooltips() {
    // Get all directory path inputs
    const pathInputs = [
        directoryPathInput,
        syncBaseDirInput,
        jpgSelectDirInput,
        orfDirInput,
        syncRawDirInput
    ];

    // Add title attribute to show tooltip on hover
    pathInputs.forEach(input => {
        if (input) {
            // Update title attribute when value changes
            input.addEventListener('input', () => {
                input.title = input.value;
            });

            // Set initial title if value exists
            if (input.value) {
                input.title = input.value;
            }
        }
    });
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
