const electron = require('electron')
const {app, dialog, ipcMain, ipcRenderer, shell} = require('electron');
const { fstat } = require('original-fs');
const path = require('path');
var dir = path.join(path.dirname(__dirname));
var curWindow;

const BrowserWindow = electron.BrowserWindow;

const BWindow = require('electron');

const createWindow = () => {
    const win = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
      width: 1060,
      height: 700
    })
  
    win.loadFile('./ApplicationSupport/html/main-page.htm')
    curWindow = win;
}
  
app.whenReady().then(() => {
    createWindow()
})

ipcMain.on('get-dir-path', (event) => {
  event.returnValue = dir;
});

ipcMain.on('resize-window', (event) => {
  const mainWindow = BrowserWindow.getFocusedWindow(); 
  mainWindow.setSize(1400, 900);
})

const icon = __dirname + 'icon.icns';


