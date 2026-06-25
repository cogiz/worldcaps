const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    // 1. Force the frame to start at your exact dimensions
    width: 1024,
    height: 1024,

    // 2. Lock the window limits so it can never be stretched or shrunk
    minWidth: 1024,
    minHeight: 1024,
    maxWidth: 1024,
    maxHeight: 1024,

    // 3. Ensure the inner game content area is exactly 1024x1024, excluding borders
    useContentSize: true,   

    // 4. Completely disable the maximize button and manual window dragging/stretching
    resizable: false,       
    fullscreenable: false,  

    // 5. Hide the top application menu bar to maximize screen space
    autoHideMenuBar: true,  

    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'worldcaps_globe_intro.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
