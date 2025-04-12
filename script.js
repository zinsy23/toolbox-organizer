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
    
    // Add grid lines for visual reference
    const gridEl = document.createElement('div');
    gridEl.className = 'drawer-grid';
    gridEl.style.width = '100%';
    gridEl.style.height = '100%';
    selectedDrawerViewEl.appendChild(gridEl);
    
    // Render items in this drawer
    const drawerItems = state.drawerItems[drawer.id] || [];
    console.log('Rendering drawer items:', drawerItems);
    
    if (drawerItems.length === 0) {
        // Add a placeholder message when drawer is empty
        const placeholderEl = document.createElement('div');
        placeholderEl.className = 'empty-drawer-placeholder';
        placeholderEl.innerHTML = '<p>This drawer is empty.</p><p>Drag items here from the Available Items.</p>';
        selectedDrawerViewEl.appendChild(placeholderEl);
    } else {
        drawerItems.forEach(item => {
            console.log('Rendering item:', item);
            renderDrawerItem(item);
        });
    }
}

// Render a single item in the drawer
function renderDrawerItem(item) {
    const scale = 20; // Scale for display (pixels per inch)
    
    // Find the actual item from our items list
    const itemData = state.items.find(i => i.id === item.itemId);
    if (!itemData) {
        console.error('Item data not found:', item);
        return;
    }
    
    const itemEl = document.createElement('div');
    itemEl.className = 'drawer-item';
    itemEl.setAttribute('data-id', item.itemId);
    itemEl.setAttribute('data-type', 'drawer');
    itemEl.setAttribute('data-item-instance-id', item.instanceId);
    
    // Use itemData for width and height
    itemEl.style.width = `${itemData.width * scale}px`;
    itemEl.style.height = `${itemData.height * scale}px`;
    itemEl.style.left = `${item.x * scale}px`;
    itemEl.style.top = `${item.y * scale}px`;
    
    // Add item name label
    const labelEl = document.createElement('div');
    labelEl.className = 'item-label';
    labelEl.textContent = itemData.name;
    itemEl.appendChild(labelEl);
    
    // Add direct event handler to make sure it's draggable
    itemEl.addEventListener('mousedown', handleMouseDown);
    
    selectedDrawerViewEl.appendChild(itemEl);
    
    console.log('Item rendered with direct event listener:', {
        itemId: item.itemId,
        instanceId: item.instanceId,
        name: itemData.name,
        x: item.x,
        y: item.y,
        width: itemData.width,
        height: itemData.height
    });
}

// Handle Mouse Down (start drag)
function handleMouseDown(e) {
    console.log('Mouse down event on:', e.target);
    
    const target = e.target.closest('.tool-item, .drawer-item');
    if (!target) {
        console.log('No valid target found for dragging');
        return;
    }
    
    const itemType = target.dataset.type;
    const itemId = parseInt(target.dataset.id);
    
    console.log('Mouse down on item:', {
        type: itemType,
        id: itemId,
        element: target,
        tagName: target.tagName,
        className: target.className,
        attributes: {
            id: target.getAttribute('data-id'),
            type: target.getAttribute('data-type'),
            instanceId: target.getAttribute('data-item-instance-id')
        }
    });
    
    // Only allow dragging if a drawer is selected for palette items
    if (itemType === 'palette' && !state.selectedDrawerId) {
        showMessage('Please select a drawer or shelf first before dragging items.');
        return;
    }
    
    // Calculate offset from the top-left corner of the item
    const rect = target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    // Store dragged item info
    state.draggedItem = {
        el: target,
        id: itemId,
        type: itemType
    };
    
    if (itemType === 'drawer') {
        // If dragging from drawer, get the instance ID (as string, not number)
        state.draggedItem.instanceId = target.dataset.itemInstanceId;
        
        console.log('Dragging drawer item:', {
            id: itemId,
            type: itemType,
            instanceId: state.draggedItem.instanceId,
            instanceIdAttribute: target.dataset.itemInstanceId
        });
    }
    
    state.dragOffset = { x: offsetX, y: offsetY };
    
    // Create a clone for dragging instead of moving the original
    const clone = target.cloneNode(true);
    clone.classList.add('dragging');
    clone.style.position = 'fixed';
    clone.style.left = `${e.clientX - offsetX}px`;
    clone.style.top = `${e.clientY - offsetY}px`;
    clone.style.zIndex = '1000';
    clone.style.opacity = '0.8';
    clone.id = 'drag-clone';
    
    document.body.appendChild(clone);
    console.log('Drag clone created:', clone);
    
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
    
    console.log('Mouse up with dragged item:', state.draggedItem);
    
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
            // Get the current drawer
            const drawer = state.drawers.find(d => d.id === state.selectedDrawerId);
            if (!drawer) return;
            
            // Convert position to drawer coordinates
            const scale = 20; // Scale (pixels per inch)
            
            // Calculate position relative to drawer, accounting for scroll
            let x = (itemRect.left - selectedDrawerRect.left + selectedDrawerViewEl.scrollLeft) / scale;
            let y = (itemRect.top - selectedDrawerRect.top + selectedDrawerViewEl.scrollTop) / scale;
            
            // Get item details
            const itemData = state.items.find(item => item.id === id);
            
            if (itemData) {
                // Round to nearest 0.25 inch for more precise placement
                x = Math.round(x * 4) / 4;
                y = Math.round(y * 4) / 4;
                
                // Ensure the item stays within bounds
                x = Math.max(0, Math.min(x, state.toolbox.width - itemData.width));
                y = Math.max(0, Math.min(y, drawer.height - itemData.height));
                
                console.log('Attempting to place item:', {
                    id: id,
                    name: itemData.name,
                    x: x,
                    y: y,
                    width: itemData.width,
                    height: itemData.height,
                    instanceId: instanceId || 'new'
                });
                
                // Just allow placement for debugging
                if (type === 'palette') {
                    // Adding from palette creates a new instance
                    const newInstanceId = Date.now().toString(); // Store as string
                    state.drawerItems[state.selectedDrawerId] = state.drawerItems[state.selectedDrawerId] || [];
                    state.drawerItems[state.selectedDrawerId].push({
                        itemId: id,
                        instanceId: newInstanceId,
                        x: x,
                        y: y
                    });
                    
                    console.log('Added new item from palette:', {
                        itemId: id, 
                        instanceId: newInstanceId,
                        x: x,
                        y: y
                    });
                    
                    renderSelectedDrawerView();
                } else if (type === 'drawer') {
                    // Find and update existing drawer item (using string comparison)
                    const itemIndex = state.drawerItems[state.selectedDrawerId].findIndex(item => 
                        item.instanceId == instanceId // use loose equality to handle string/number comparison
                    );
                    
                    console.log('Trying to find item with instanceId:', {
                        looking_for: instanceId,
                        drawer_items: state.drawerItems[state.selectedDrawerId].map(i => i.instanceId)
                    });
                    
                    if (itemIndex !== -1) {
                        state.drawerItems[state.selectedDrawerId][itemIndex].x = x;
                        state.drawerItems[state.selectedDrawerId][itemIndex].y = y;
                        
                        console.log('Updated existing drawer item:', {
                            itemId: id,
                            instanceId: instanceId,
                            x: x,
                            y: y,
                            index: itemIndex
                        });
                        
                        renderSelectedDrawerView();
                    } else {
                        console.error('Could not find item with instanceId:', instanceId);
                    }
                }
            } else {
                console.error('Item data not found for id:', id);
            }
        } else {
            // If not over drawer and it's a drawer item, remove it
            if (type === 'drawer') {
                const itemIndex = state.drawerItems[state.selectedDrawerId].findIndex(item => 
                    item.instanceId == instanceId // use loose equality for comparison
                );
                
                if (itemIndex !== -1) {
                    console.log('Removing item from drawer:', {
                        instanceId: instanceId,
                        index: itemIndex
                    });
                    state.drawerItems[state.selectedDrawerId].splice(itemIndex, 1);
                }
                
                renderSelectedDrawerView();
            }
        }
    }
    
    // Reset dragged item
    state.draggedItem = null;
}

// Check if position is valid (within bounds and not overlapping)
function isValidPosition(x, y, width, height, currentInstanceId = null) {
    const drawer = state.drawers.find(d => d.id === state.selectedDrawerId);
    if (!drawer) return false;
    
    const { width: drawerWidth } = state.toolbox;
    const drawerHeight = drawer.height;
    
    // Check if within bounds with a bit more tolerance
    const margin = 0.05; // 0.05 inch margin for boundary checking
    if (x < -margin || y < -margin || x + width > drawerWidth + margin || y + height > drawerHeight + margin) {
        console.log('Out of bounds:', { x, y, width, height, drawerWidth, drawerHeight });
        return false;
    }
    
    // Allow placement if drawer is empty
    const drawerItems = state.drawerItems[state.selectedDrawerId] || [];
    if (drawerItems.length === 0) {
        return true;
    }
    
    // If we're moving an existing item and it's the only item in the drawer, allow it
    if (currentInstanceId && drawerItems.length === 1 && 
        drawerItems[0].instanceId === currentInstanceId) {
        return true;
    }
    
    // Check for overlap with other items
    for (const item of drawerItems) {
        // Skip the current item if we're moving it
        if (currentInstanceId && item.instanceId === currentInstanceId) {
            continue;
        }
        
        const itemData = state.items.find(i => i.id === item.itemId);
        if (!itemData) {
            console.warn('Item data not found for item:', item);
            continue;
        }
        
        // Use a smaller gap to allow items to be placed closer together
        const gap = 0.05; // 0.05 inch gap between items (reduced from 0.1)
        
        // Check for intersection with gap
        const overlaps = !(
            x + width <= item.x - gap ||
            x >= item.x + itemData.width + gap ||
            y + height <= item.y - gap ||
            y >= item.y + itemData.height + gap
        );
        
        if (overlaps) {
            console.log('Overlap detected:', {
                new: { x, y, width, height },
                existing: { 
                    itemId: item.itemId,
                    instanceId: item.instanceId,
                    x: item.x, 
                    y: item.y, 
                    width: itemData.width, 
                    height: itemData.height 
                }
            });
            return false;
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
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app');
    initApp();
    
    // Additional check to ensure event listeners are set up
    console.log('Manually adding event listeners');
    document.addEventListener('mousedown', (e) => {
        console.log('Global mousedown event detected');
        handleMouseDown(e);
    });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Add event listener for all existing drawer items
    document.querySelectorAll('.drawer-item').forEach(item => {
        console.log('Adding event listener to existing drawer item:', item);
        item.addEventListener('mousedown', handleMouseDown);
    });
});

// Let's add direct debugging to every step of a click
document.addEventListener('click', function(e) {
    console.log('Click event on:', e.target);
});

// Force refresh the view
setTimeout(() => {
    console.log('Forcing refresh of views');
    renderDrawersList();
    renderSelectedDrawerView();
    renderItems();
}, 1000); 