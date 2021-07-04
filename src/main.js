// https://www.electronjs.org/docs/tutorial/first-app
// https://github.com/mike-ward/electron-riot/blob/master/src/main.js

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let window;

function createWindow () {
    window = new BrowserWindow({width: 1200, height: 1200});
    window.loadURL('file://' + __dirname + '/electron_index.html');
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    app.quit();
});

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
