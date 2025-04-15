# Toolbox Organizer

An interactive web application for organizing tools in a toolbox with customizable drawers and shelves.

## Features

- Create a toolbox with custom dimensions
- Add, edit, and remove drawers and shelves
- Drag and drop tools into the drawers/shelves
- Generate random tools with different dimensions
- Prevents tools from overlapping when organizing
- Visual representation of the toolbox and its contents

## How to Use

1. **Set Up the Toolbox:**
   - Enter width, height, and depth dimensions for your toolbox
   - Click "Update" to apply the dimensions

2. **Add Drawers and Shelves:**
   - Click "Add Drawer" or "Add Shelf" buttons
   - The drawer/shelf will appear in the toolbox visualization
   - Drawers and shelves can be removed by clicking the "Remove" button

3. **Select a Drawer/Shelf:**
   - Click on a drawer or shelf in the toolbox to select it
   - The selected drawer/shelf will be highlighted and available for editing

4. **Organize Tools:**
   - When a drawer/shelf is selected, you can drag tools from the "Available Items" section
   - Drop tools onto the selected drawer/shelf
   - Tools will snap back if they would overlap with other tools or exceed drawer boundaries
   - Tools can be rearranged by dragging them within the drawer
   - Tools can be removed by dragging them outside the drawer

5. **Generate New Tools:**
   - Click "Generate Random Items" to get a new set of tools with different dimensions

## Running the Application

Simply open the `index.html` file in a web browser to run the application locally. No server or installation required.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Drag and Drop API

## Browser Compatibility

This application works best in modern browsers that support ES6 and the Drag and Drop API, including:
- Chrome
- Firefox
- Edge
- Safari 

## Future Work:
- Fix collision detection bugs
- Remove shelf feature
- Make the toolbox more realistic
- Dimensions on a per drawer basis
- Drag tool holders in drawers free form
- Tool holders are a 2D realistic view of that product