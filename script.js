// DOM Elements
const toolboxWidthInput = document.getElementById('toolbox-width');
const toolboxHeightInput = document.getElementById('toolbox-height');
const toolboxDepthInput = document.getElementById('toolbox-depth');
const updateDimensionsBtn = document.getElementById('update-dimensions');
const addDrawerBtn = document.getElementById('add-drawer');
const addShelfBtn = document.getElementById('add-shelf');
const drawersListEl = document.getElementById('drawers-list');
const toolboxEl = document.getElementById('toolbox');
const drawerLabelsEl = document.getElementById('drawer-labels');
const currentSelectionEl = document.getElementById('current-selection');
const itemsContainerEl = document.getElementById('items-container');
const selectedDrawerViewEl = document.getElementById('selected-drawer-view');
const generateItemsBtn = document.getElementById('generate-items');

// Application State
const state = {
    toolbox: {
        width: parseInt(toolboxWidthInput.value) || 20,
        height: parseInt(toolboxHeightInput.value) || 12,
        depth: parseInt(toolboxDepthInput.value) || 6
    },
    drawers: [],
    selectedDrawerId: null,
    items: [],
    drawerItems: {},
    nextItemId: 1,
    nextDrawerId: 1,
    draggedItem: null,
    dragOffset: { x: 0, y: 0 }
};

// Initialize the application
function initApp() {
    updateToolboxDisplay();
    generateRandomItems();
    setupEventListeners();
}

// Setup Event Listeners
function setupEventListeners() {
    updateDimensionsBtn.addEventListener('click', handleUpdateDimensions);
    addDrawerBtn.addEventListener('click', () => addDrawerOrShelf('drawer'));
    addShelfBtn.addEventListener('click', () => addDrawerOrShelf('shelf'));
    generateItemsBtn.addEventListener('click', generateRandomItems);
    
    // Drag and drop events
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

// Handle Update Dimensions
function handleUpdateDimensions() {
    state.toolbox.width = parseInt(toolboxWidthInput.value) || state.toolbox.width;
    state.toolbox.height = parseInt(toolboxHeightInput.value) || state.toolbox.height;
    state.toolbox.depth = parseInt(toolboxDepthInput.value) || state.toolbox.depth;
    
    updateToolboxDisplay();
    updateDrawers();
}

// Update Toolbox Display
function updateToolboxDisplay() {
    const { width, height } = state.toolbox;
    
    // Scale for display (pixels per inch)
    const scale = 20;
    
    toolboxEl.style.width = `${width * scale}px`;
    toolboxEl.style.height = `${height * scale}px`;
}

// Add Drawer or Shelf
function addDrawerOrShelf(type) {
    const id = state.nextDrawerId++;
    const name = type === 'drawer' ? `Drawer ${id}` : `Shelf ${id}`;
    const height = type === 'drawer' ? 2 : 1; // Default heights in inches
    
    const newDrawer = {
        id,
        name,
        type,
        height,
        position: state.drawers.reduce((total, drawer) => total + drawer.height, 0)
    };
    
    state.drawers.push(newDrawer);
    state.drawerItems[id] = [];
    
    updateDrawers();
    renderDrawersList();
}

// Update Drawers
function updateDrawers() {
    // Clear current drawers
    toolboxEl.innerHTML = '';
    drawerLabelsEl.innerHTML = '';
    
    const { width, height } = state.toolbox;
    const scale = 20; // Scale for display (pixels per inch)
    
    let currentPosition = 0;
    
    state.drawers.forEach((drawer, index) => {
        // Create drawer element
        const drawerEl = document.createElement('div');
        drawerEl.className = `drawer ${drawer.type === 'shelf' ? 'shelf' : ''} ${state.selectedDrawerId === drawer.id ? 'selected' : ''}`;
        drawerEl.dataset.id = drawer.id;
        
        // Position and size the drawer
        const drawerHeight = drawer.height * scale;
        drawerEl.style.height = `${drawerHeight}px`;
        drawerEl.style.width = '100%';
        drawerEl.style.top = `${currentPosition * scale}px`;
        
        // Create drawer label
        const labelEl = document.createElement('div');
        labelEl.className = 'drawer-label';
        labelEl.style.height = `${drawerHeight}px`;
        labelEl.style.top = `${currentPosition * scale}px`;
        labelEl.textContent = index + 1;
        labelEl.dataset.id = drawer.id;
        
        // Add click event to select drawer
        drawerEl.addEventListener('click', () => selectDrawer(drawer.id));
        labelEl.addEventListener('click', () => selectDrawer(drawer.id));
        
        toolboxEl.appendChild(drawerEl);
        drawerLabelsEl.appendChild(labelEl);
        
        currentPosition += drawer.height;
    });
    
    // If a drawer was selected, make sure it's still selected
    if (state.selectedDrawerId) {
        renderSelectedDrawerView();
    }
}

// Select a drawer
function selectDrawer(id) {
    state.selectedDrawerId = id;
    
    // Find the drawer
    const drawer = state.drawers.find(d => d.id === id);
    currentSelectionEl.textContent = drawer ? drawer.name : 'None';
    
    updateDrawers();
    renderSelectedDrawerView();
}

// Render the drawers list in the sidebar
function renderDrawersList() {
    drawersListEl.innerHTML = '';
    
    state.drawers.forEach(drawer => {
        const drawerItemEl = document.createElement('div');
        drawerItemEl.className = `drawer-list-item ${state.selectedDrawerId === drawer.id ? 'selected' : ''}`;
        
        const nameEl = document.createElement('span');
        nameEl.textContent = drawer.name;
        
        const actionsEl = document.createElement('div');
        
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectDrawer(drawer.id);
        });
        
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeDrawer(drawer.id);
        });
        
        actionsEl.appendChild(editBtn);
        actionsEl.appendChild(removeBtn);
        
        drawerItemEl.appendChild(nameEl);
        drawerItemEl.appendChild(actionsEl);
        
        drawerItemEl.addEventListener('click', () => selectDrawer(drawer.id));
        
        drawersListEl.appendChild(drawerItemEl);
    });
}

// Remove a drawer
function removeDrawer(id) {
    const index = state.drawers.findIndex(d => d.id === id);
    if (index !== -1) {
        state.drawers.splice(index, 1);
        delete state.drawerItems[id];
        
        // If the removed drawer was selected, deselect it
        if (state.selectedDrawerId === id) {
            state.selectedDrawerId = null;
            currentSelectionEl.textContent = 'None';
        }
        
        // Recalculate positions
        let position = 0;
        state.drawers.forEach(drawer => {
            drawer.position = position;
            position += drawer.height;
        });
        
        updateDrawers();
        renderDrawersList();
        renderSelectedDrawerView();
    }
}

// Generate random items for the palette
function generateRandomItems() {
    state.items = [];
    const shapes = [
        { name: 'Screwdriver', width: 1, height: 6 },
        { name: 'Hammer', width: 2, height: 10 },
        { name: 'Pliers', width: 1.5, height: 7 },
        { name: 'Wrench', width: 1, height: 8 },
        { name: 'Drill Bit', width: 0.5, height: 4 },
        { name: 'Tape Measure', width: 3, height: 3 },
        { name: 'Level', width: 2, height: 12 },
        { name: 'Chisel', width: 1, height: 7 },
        { name: 'Saw', width: 4, height: 10 },
        { name: 'Clamp', width: 2, height: 5 }
    ];
    
    // Generate 10 random items
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * shapes.length);
        const shape = shapes[randomIndex];
        
        // Add some randomness to dimensions
        const widthVariation = (Math.random() * 0.5) - 0.25; // +/- 25%
        const heightVariation = (Math.random() * 0.5) - 0.25; // +/- 25%
        
        const item = {
            id: state.nextItemId++,
            name: shape.name,
            width: Math.max(0.5, shape.width + (shape.width * widthVariation)),
            height: Math.max(0.5, shape.height + (shape.height * heightVariation))
        };
        
        state.items.push(item);
    }
    
    renderItems();
}

// Render items in the palette
function renderItems() {
    itemsContainerEl.innerHTML = '';
    
    const scale = 10; // Scale for display (pixels per inch)
    
    let offsetX = 10;
    let offsetY = 10;
    let rowHeight = 0;
    
    // Add different colors for better visibility
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    
    state.items.forEach((item, index) => {
        const itemWidth = Math.round(item.width * scale);
        const itemHeight = Math.round(item.height * scale);
        
        // Check if we need to move to next row
        if (offsetX + itemWidth > itemsContainerEl.clientWidth - 20) {
            offsetX = 10;
            offsetY += rowHeight + 15;
            rowHeight = 0;
        }
        
        const itemEl = document.createElement('div');
        itemEl.className = 'tool-item';
        itemEl.dataset.id = item.id;
        itemEl.dataset.type = 'palette';
        itemEl.style.width = `${itemWidth}px`;
        itemEl.style.height = `${itemHeight}px`;
        itemEl.style.left = `${offsetX}px`;
        itemEl.style.top = `${offsetY}px`;
        itemEl.style.backgroundColor = colors[index % colors.length];
        itemEl.style.boxShadow = '2px 2px 5px rgba(0, 0, 0, 0.2)';
        itemEl.innerHTML = `${item.name}<br>${item.width.toFixed(1)}" × ${item.height.toFixed(1)}"`;
        
        itemsContainerEl.appendChild(itemEl);
        
        // Update offsets for next item
        offsetX += itemWidth + 15; // Increased spacing
        rowHeight = Math.max(rowHeight, itemHeight);
    });
    
    // Update container height to fit all items and add more space
    itemsContainerEl.style.height = `${offsetY + rowHeight + 20}px`;
    itemsContainerEl.style.minHeight = '250px';
}

// Render selected drawer view
function renderSelectedDrawerView() {
    selectedDrawerViewEl.innerHTML = '';
    
    if (!state.selectedDrawerId) {
        selectedDrawerViewEl.innerHTML = '<p class="no-selection">No drawer selected</p>';
        return;
    }
    
    const drawer = state.drawers.find(d => d.id === state.selectedDrawerId);
    if (!drawer) return;
    
    const { width } = state.toolbox;
    const drawerHeight = drawer.height;
    
    const scale = 20; // Scale for display (pixels per inch)
    
    selectedDrawerViewEl.style.width = `${width * scale}px`;
    selectedDrawerViewEl.style.height = `${drawerHeight * scale}px`;
    
    // Render items in this drawer
    const drawerItems = state.drawerItems[drawer.id] || [];
    
    if (drawerItems.length === 0) {
        // Add a placeholder message when drawer is empty
        const placeholderEl = document.createElement('div');
        placeholderEl.className = 'empty-drawer-placeholder';
        placeholderEl.innerHTML = '<p>This drawer is empty.</p><p>Drag items here from the Available Items.</p>';
        selectedDrawerViewEl.appendChild(placeholderEl);
    } else {
        drawerItems.forEach(item => {
            renderDrawerItem(item);
        });
    }
}

// Render a single item in the drawer
function renderDrawerItem(item) {
    const itemData = state.items.find(i => i.id === item.itemId);
    if (!itemData) return;
    
    const scale = 20; // Scale for display (pixels per inch)
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    
    const itemEl = document.createElement('div');
    itemEl.className = 'tool-item';
    itemEl.dataset.id = item.itemId;
    itemEl.dataset.itemInstanceId = item.instanceId;
    itemEl.dataset.type = 'drawer';
    itemEl.style.width = `${itemData.width * scale}px`;
    itemEl.style.height = `${itemData.height * scale}px`;
    itemEl.style.left = `${item.x * scale}px`;
    itemEl.style.top = `${item.y * scale}px`;
    itemEl.style.backgroundColor = colors[item.itemId % colors.length];
    itemEl.style.boxShadow = '2px 2px 5px rgba(0, 0, 0, 0.2)';
    itemEl.innerHTML = `${itemData.name}<br>${itemData.width.toFixed(1)}" × ${itemData.height.toFixed(1)}"`;
    
    selectedDrawerViewEl.appendChild(itemEl);
}

// Handle Mouse Down (start drag)
function handleMouseDown(e) {
    if (!e.target.matches('.tool-item')) return;
    
    const itemEl = e.target;
    const itemId = parseInt(itemEl.dataset.id);
    const itemType = itemEl.dataset.type;
    
    // Only allow dragging if a drawer is selected for palette items
    if (itemType === 'palette' && !state.selectedDrawerId) {
        alert('Please select a drawer or shelf first before dragging items.');
        return;
    }
    
    // Calculate offset from the top-left corner of the item
    const rect = itemEl.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    // Store dragged item and offset
    state.draggedItem = {
        el: itemEl,
        id: itemId,
        type: itemType
    };
    
    if (itemType === 'drawer') {
        // If dragging from drawer, get the instance ID too
        state.draggedItem.instanceId = parseInt(itemEl.dataset.itemInstanceId);
    }
    
    state.dragOffset = { x: offsetX, y: offsetY };
    
    // Create a clone for dragging instead of moving the original
    const clone = itemEl.cloneNode(true);
    clone.classList.add('dragging');
    clone.style.position = 'fixed'; // Use fixed positioning for the drag clone
    clone.style.left = `${e.clientX - offsetX}px`;
    clone.style.top = `${e.clientY - offsetY}px`;
    clone.style.zIndex = '1000';
    clone.style.opacity = '0.8';
    clone.id = 'drag-clone';
    
    document.body.appendChild(clone);
    
    // Prevent default drag behavior
    e.preventDefault();
}

// Handle Mouse Move (drag)
function handleMouseMove(e) {
    if (!state.draggedItem) return;
    
    const dragClone = document.getElementById('drag-clone');
    if (!dragClone) return;
    
    // Move the clone element
    dragClone.style.left = `${e.clientX - state.dragOffset.x}px`;
    dragClone.style.top = `${e.clientY - state.dragOffset.y}px`;
    
    // Prevent default behaviors
    e.preventDefault();
}

// Handle Mouse Up (drop)
function handleMouseUp(e) {
    if (!state.draggedItem) return;
    
    const { id, type, instanceId } = state.draggedItem;
    const dragClone = document.getElementById('drag-clone');
    
    if (dragClone) {
        // Get position of the drag clone
        const itemRect = dragClone.getBoundingClientRect();
        
        // Remove the drag clone
        document.body.removeChild(dragClone);
        
        // Check if dropped on the selected drawer
        const selectedDrawerRect = selectedDrawerViewEl.getBoundingClientRect();
        
        const isOverDrawer = !(
            itemRect.right < selectedDrawerRect.left ||
            itemRect.left > selectedDrawerRect.right ||
            itemRect.bottom < selectedDrawerRect.top ||
            itemRect.top > selectedDrawerRect.bottom
        );
        
        if (isOverDrawer && state.selectedDrawerId) {
            // Convert position to drawer coordinates
            const scale = 20; // Scale (pixels per inch)
            
            // Calculate center position of the item
            const centerX = (itemRect.left + itemRect.right) / 2;
            const centerY = (itemRect.top + itemRect.bottom) / 2;
            
            // Convert to drawer coordinates, centering the item where the mouse is
            const x = (centerX - selectedDrawerRect.left) / scale - (itemRect.width / scale / 2);
            const y = (centerY - selectedDrawerRect.top) / scale - (itemRect.height / scale / 2);
            
            // Round to improve grid alignment
            const roundedX = Math.round(x * 2) / 2;
            const roundedY = Math.round(y * 2) / 2;
            
            // Get item details
            const itemData = state.items.find(item => item.id === id);
            
            if (itemData) {
                // Check if position is valid (within bounds and not overlapping other items)
                const isValid = isValidPosition(roundedX, roundedY, itemData.width, itemData.height, instanceId);
                
                if (isValid) {
                    // If dragging from palette, create new instance
                    if (type === 'palette') {
                        const instanceId = Date.now(); // Use timestamp as unique instance ID
                        state.drawerItems[state.selectedDrawerId].push({
                            itemId: id,
                            instanceId,
                            x: roundedX,
                            y: roundedY
                        });
                    } 
                    // If dragging from drawer, update position
                    else if (type === 'drawer') {
                        const itemIndex = state.drawerItems[state.selectedDrawerId].findIndex(item => 
                            item.instanceId === instanceId
                        );
                        
                        if (itemIndex !== -1) {
                            state.drawerItems[state.selectedDrawerId][itemIndex].x = roundedX;
                            state.drawerItems[state.selectedDrawerId][itemIndex].y = roundedY;
                        }
                    }
                    
                    // Re-render the drawer
                    renderSelectedDrawerView();
                } else {
                    // Try to find a valid position nearby
                    const newPos = findValidPosition(roundedX, roundedY, itemData.width, itemData.height, instanceId);
                    if (newPos) {
                        // Valid position found nearby
                        if (type === 'palette') {
                            const instanceId = Date.now();
                            state.drawerItems[state.selectedDrawerId].push({
                                itemId: id,
                                instanceId,
                                x: newPos.x,
                                y: newPos.y
                            });
                            renderSelectedDrawerView();
                        } else if (type === 'drawer') {
                            const itemIndex = state.drawerItems[state.selectedDrawerId].findIndex(item => 
                                item.instanceId === instanceId
                            );
                            
                            if (itemIndex !== -1) {
                                state.drawerItems[state.selectedDrawerId][itemIndex].x = newPos.x;
                                state.drawerItems[state.selectedDrawerId][itemIndex].y = newPos.y;
                                renderSelectedDrawerView();
                            }
                        }
                    } else {
                        // If invalid position and no valid position found nearby, show a message
                        showMessage("Items can't overlap or exceed drawer boundaries!");
                        
                        // Re-render to reset
                        renderSelectedDrawerView();
                        renderItems();
                    }
                }
            }
        } else {
            // If not over drawer, check if this was a drawer item being removed
            if (type === 'drawer') {
                // Remove the item from the drawer
                const itemIndex = state.drawerItems[state.selectedDrawerId].findIndex(item => 
                    item.instanceId === instanceId
                );
                
                if (itemIndex !== -1) {
                    state.drawerItems[state.selectedDrawerId].splice(itemIndex, 1);
                }
                
                // Re-render
                renderSelectedDrawerView();
            } else {
                // Just re-render to reset
                renderItems();
            }
        }
    }
    
    // Reset dragged item
    state.draggedItem = null;
}

// Try to find a valid position near the attempted drop point
function findValidPosition(x, y, width, height, currentInstanceId) {
    // Grid search for a valid position
    const searchRadius = 2; // Search up to 2 inches in each direction
    const gridStep = 0.5; // Check every 0.5 inch
    
    // Get toolbox boundaries
    const drawer = state.drawers.find(d => d.id === state.selectedDrawerId);
    if (!drawer) return null;
    
    const { width: maxWidth } = state.toolbox;
    const maxHeight = drawer.height;
    
    // Try positions in a spiral pattern outward from the original point
    for (let r = 0; r <= searchRadius; r += gridStep) {
        // Try positions along the perimeter of the current radius
        for (let dx = -r; dx <= r; dx += gridStep) {
            for (let dy = -r; dy <= r; dy += gridStep) {
                // Skip if not on the perimeter
                if (r > 0 && Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
                
                const newX = Math.max(0, Math.min(x + dx, maxWidth - width));
                const newY = Math.max(0, Math.min(y + dy, maxHeight - height));
                
                if (isValidPosition(newX, newY, width, height, currentInstanceId)) {
                    return { x: newX, y: newY };
                }
            }
        }
    }
    
    return null; // No valid position found
}

// Check if position is valid (within bounds and not overlapping)
function isValidPosition(x, y, width, height, currentInstanceId = null) {
    const drawer = state.drawers.find(d => d.id === state.selectedDrawerId);
    if (!drawer) return false;
    
    const { width: drawerWidth } = state.toolbox;
    const drawerHeight = drawer.height;
    
    // Check if within bounds with a small margin
    const margin = 0.01; // Small margin to avoid edge cases
    if (x < -margin || y < -margin || x + width > drawerWidth + margin || y + height > drawerHeight + margin) {
        return false;
    }
    
    // Check for overlap with other items
    const drawerItems = state.drawerItems[state.selectedDrawerId] || [];
    
    for (const item of drawerItems) {
        // Skip the current item if we're moving it
        if (currentInstanceId && item.instanceId === currentInstanceId) {
            continue;
        }
        
        const itemData = state.items.find(i => i.id === item.itemId);
        if (!itemData) continue;
        
        // Add a small buffer to avoid touching items
        const buffer = 0.05; // Small buffer in inches
        
        // Check for intersection with buffer
        if (!(
            x + width + buffer <= item.x ||
            x >= item.x + itemData.width + buffer ||
            y + height + buffer <= item.y ||
            y >= item.y + itemData.height + buffer
        )) {
            return false; // Overlapping
        }
    }
    
    return true;
}

// Show temporary message
function showMessage(text) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message';
    messageEl.textContent = text;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.classList.add('message-fade');
        setTimeout(() => {
            document.body.removeChild(messageEl);
        }, 500);
    }, 2000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp); 