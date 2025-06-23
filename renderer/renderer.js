// DOM Elements
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

// State
let currentStructure = [];
let selectedDirectory = null;
let savedStructures = [];
let currentParentFolder = null; // For adding subfolders
let isEditingExistingStructure = false;

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
    renderStructureTree();
    setupEventListeners();
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
}

// Update the status bar
function updateStatus(message, isError = false) {
    statusBar.textContent = message;
    statusBar.style.backgroundColor = isError ? '#ffdddd' : '#f9f9f9';
    statusBar.style.color = isError ? '#d32f2f' : '#333';
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);