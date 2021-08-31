// https://www.electronjs.org/docs/tutorial/first-app
// https://github.com/mike-ward/electron-riot/blob/master/src/main.js

const electron = require('electron');
const windowStateKeeper = require('electron-window-state');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow = null;



function createWindow () {
    
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800
  });

  const windowOptions = {
      title: 'main',
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      autoHideMenuBar: true,
      show: false,
    };

  mainWindow = new BrowserWindow(windowOptions);
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindowState.manage(mainWindow);

  mainWindow.loadURL('file://' + __dirname + '/dist/index.html');
}


app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
  })
})

app.on('window-all-closed', function () {
    app.quit();
});