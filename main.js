const path = require('path');
const { app, BrowserWindow } = require('electron');
const debug = /--debug/.test(process.argv[2]);

let mainWindow;
// Quit when all windows are closed.
app.on('window-all-closed', function() {
    if (process.platform != 'darwin') app.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
    // Create the browser window.
    let windowOptions = {
        width: 1080,
        minWidth: 680,
        height: 840,
        title: app.getName(),
        frame: false
    };
    mainWindow = new BrowserWindow(windowOptions);
    // Launch fullscreen with DevTools open, usage: npm run debug
    if (debug) {
        mainWindow.webContents.openDevTools();
        mainWindow.maximize();
        require('devtron').install();
    }
    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
});
