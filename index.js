const electron = require('electron')
const {app, dialog, ipcMain, ipcRenderer, shell} = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Menu } = require('electron');
const asar = require('asar');
var dir = path.join(path.dirname(__dirname));
var curWindow;

const BrowserWindow = electron.BrowserWindow;

const createWindow = () => {
    const win = new BrowserWindow({
      frame: false,
      titleBarStyle: 'hidden',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
      },
      width: 360,
      height: 700
    })
  
    win.loadFile('app-page.htm')
    curWindow = win;

}
  
app.whenReady().then(() => {
  createWindow();
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
})

ipcMain.on('get-dir-path', (event) => {
  event.returnValue = dir;
});

ipcMain.on('resize-window', (event,tacticType) => {
  let winWidth;
  if (tacticType === 'doximity') {
    winWidth = 1400;
  }else if (tacticType === 'epocrates') {
    winWidth = 1020;
  }
  const mainWindow = BrowserWindow.getFocusedWindow(); 
  mainWindow.setSize(winWidth, 900);
})

ipcMain.on('resize-window-default', (event, tacticType) => {
  let winWidth;
  if (tacticType === 'doximity') {
    winWidth = 1060;
  }else if (tacticType === 'epocrates') {
    winWidth = 1020;
  }else if (!tacticType) {
    winWidth = 1060;
  }

  const mainWindow = BrowserWindow.getFocusedWindow(); 
  mainWindow.setSize(winWidth, 700);
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

ipcMain.handle('extractAsar', async (event, asarFilePath, outputDir) => {
  try {
    await extractAsar(asarFilePath, outputDir);
    return true;
  } catch (error) {
    console.error('Error extracting ASAR:', error);
    return false;
  }
});

async function extractAsar(asarFilePath, outputDir) {
  return new Promise((resolve, reject) => {
    asar.extractAll(asarFilePath, outputDir, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}


const icon = __dirname + 'icon.icns';

const documentsPath = app.getPath('documents');
console.log(documentsPath);


const menuTemplate = [
  {
    label: 'Null'
  },
  {
    label: 'File',
    submenu: [
      {
        label: 'Create New Alert',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          console.log('New Alert');
        }
      },
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: (menuItem, browserWindow) => {
          if (browserWindow) {
            browserWindow.reload();
          }
        }
      },
      {
        label: 'Update',
        accelerator: 'CmdOrCtrl+U',
        click: () => {
          console.log('updating');
        }
      },
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          app.quit();
        }
      }
      // Add additional submenu items for the "Edit" menu
    ]
  },
  {
    label: 'Settings',
    submenu: [
      {
        label: 'View DevTools',
        accelerator: 'CmdOrCtrl+Alt+I',
        click: (menuItem, browserWindow) => {
          browserWindow.webContents.toggleDevTools();
        }
      }
    ]
  }
  // Add more top-level menu items as needed
];





