const electron = require('electron')
const {app, dialog, ipcMain, ipcRenderer, shell} = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
var dir = path.join(path.dirname(__dirname));
var curWindow;

const BrowserWindow = electron.BrowserWindow;

const createWindow = () => {
    const win = new BrowserWindow({
      // frame: false,
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

ipcMain.on('resize-window-default', (event) => {
  const mainWindow = BrowserWindow.getFocusedWindow(); 
  mainWindow.setSize(1060, 700);
})

ipcMain.on('print-to-pdf', async (event, options) => {
  console.log(options);

  const mainWindow = BrowserWindow.fromWebContents(event.sender);

  if (!mainWindow || !mainWindow.webContents) {
    console.error('Invalid mainWindow or webContents');
    return;
  }

  mainWindow.webContents.executeJavaScript(`
    // console.log(document.documentElement.innerHTML);
  `);

  try {
    const pdfData = await mainWindow.webContents.printToPDF(options);

    console.log(options.filePath);

    fs.writeFile(options.filePath, pdfData, (error) => {
      if (error) {
        console.error('Failed to save PDF:', error);
        return;
      }
      console.log('PDF saved successfully:', options.filePath);
      event.sender.send('print-to-pdf-done');
    });
  } catch (error) {
    console.error('Failed to generate PDF:', error);
  }
});


const icon = __dirname + 'icon.icns';

// const { Menu } = require('electron');
// Menu.setApplicationMenu(null);


