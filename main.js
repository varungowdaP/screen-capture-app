const { app, BrowserWindow, ipcMain, desktopCapturer, screen, dialog, globalShortcut } = require("electron");
const path = require('path');
const fs = require('fs');

if (!app.isPackaged) {
    try { require('electron-reload')(__dirname); } catch (_) { }
}


app.whenReady().then(() => {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false, // Premium borderless look
        transparent: true,
        icon: path.join(__dirname, "icon.ico"),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    })

    window.loadFile("index.html");

    // Register global shortcut
    globalShortcut.register('CommandOrControl+Shift+3', () => {
        window.webContents.send('trigger-capture');
    });

    // Close button handler
    ipcMain.on('close-window', () => window.close());

    // Capture screen handler
    ipcMain.handle('capture-screen', async (event) => {
        // Hide window so it doesn't appear in the screenshot
        window.hide();

        // Wait 300ms to ensure the window is fully hidden
        await new Promise(resolve => setTimeout(resolve, 300));

        const primaryDisplay = screen.getPrimaryDisplay();
        const { width, height } = primaryDisplay.size;

        // Get the high-resolution screenshot
        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: {
                width: width * primaryDisplay.scaleFactor,
                height: height * primaryDisplay.scaleFactor
            }
        });

        // Show window again
        window.show();

        // Return image as base64 string to the frontend
        return sources[0].thumbnail.toDataURL();
    });

    // Save image handler
    ipcMain.handle('save-image', async (event, dataUrl) => {
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
        const { filePath } = await dialog.showSaveDialog({
            title: 'Save Screenshot',
            defaultPath: 'screenshot.png',
            filters: [{ name: 'Images', extensions: ['png'] }]
        });

        if (filePath) {
            fs.writeFileSync(filePath, base64Data, 'base64');
            return true;
        }
        return false;
    });
});
