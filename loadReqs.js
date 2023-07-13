const path = require('path');
var fs = require('fs-extra');
const PDFMerger = require('pdf-merger-js');
const { ipcRenderer, app } = require('electron');
const os = require('os');
const AdmZip = require('adm-zip');

let devVersion = true;
let showLoading = true;
let devName = 'mccajoh3';

let dirLocation = './';
let username;
let userPath;
let installPath;
let tempDir;
let setDelay;


if (!devVersion) {
  console.log('dist');
  username = os.userInfo().username;
  userPath = path.join(os.homedir(), 'Documents/Tempest/');
  dirLocation = userPath;
  installPath = userPath;
  setDelay = 1000;
  
}else { //DEV
  username = os.userInfo().username;
  userPath = __dirname + '/';
  
  //TEMP DIR
  tempDir = path.join(os.homedir(), 'Documents/Tempest/');

  //TEST SETTINGS
  setDelay = 0; // THE DELAY BETWEEN LOADING
  showLoading = false; // DISABLE DOCUMENTS
}




//LOAD THE APP CONTENT
document.addEventListener('DOMContentLoaded', async () => {  

  launchLoadScreen();

  // loadContent(); //ADD BACK IN – FOR FULL APP
});

async function launchLoadScreen() {

  let progress = document.getElementById('progress');
  let svgContainer = document.getElementById('svg-container');
  const loaderImagePath = path.join(__dirname, 'loader-image.htm');
  let svg = fs.readFileSync(loaderImagePath, 'utf-8');
  svgContainer.innerHTML = svg;


  if (showLoading) {
    await new Promise((resolve) => {
      loadDependencies('Checking for Dependencies').then(() => {
        resolve();
      });
    });
  }

  await delay(setDelay * 2);
  progress.dataset.action = 'Contacting Skynet';
  await delay(setDelay / 2);
  await loadReqFiles('loading required modules');
  await delay(setDelay * 2);
  progress.dataset.action = 'Launching Tempest';
  await delay(setDelay * 3);

  console.log(username, userPath);

  if (!devVersion) {
    await replaceInFiles(userPath, 'mccajoh3', username);
  }
  
  launchTempest();
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function loadDependencies(action) {
  return new Promise(async (resolve) => {
    progress.dataset.action = action;
    let rootFilePath;
    if (devVersion) {
      rootFilePath = tempDir;
    } else {
      rootFilePath = userPath;
    }

    let depFiles = checkDepFiles(rootFilePath);
    if (!depFiles[0]) {
      await delay(setDelay * 2);
      progress.dataset.action = 'Installing Dependencies';
      let loadModal = document.getElementById('modal');
      let loadAction = document.getElementById('modal-header');
      let loadPath = document.getElementById('save-path');
      let loadBtn = document.getElementById('modal-btn');
      loadAction.dataset.action = "Install Support Files to: ";
      loadPath.dataset.path = rootFilePath;
      loadBtn.dataset.action = "Install Files";
      loadModal.classList.remove('disable');
    } else {
      await delay(setDelay * 2);
      progress.dataset.action = 'Dependencies Loaded';
      resolve();
    }


  });
}


async function loadReqFiles(action) {
  progress.dataset.action = action;

  const styleSheetPromise = loadStyleSheet(userPath + 'ApplicationSupport/css/styles.css');
  const modulesPromise = loadScript(userPath + 'ApplicationSupport/scripts/_modules.js');

  await Promise.all([styleSheetPromise, modulesPromise]);

  await delay(setDelay);
  progress.dataset.action = 'All Required Modules are Loaded';
}

function loadStyleSheet(url) {
  return new Promise((resolve, reject) => {
    const styleSheet = document.createElement('link');
    styleSheet.rel = 'stylesheet';
    styleSheet.href = url;
    styleSheet.onload = resolve;
    styleSheet.onerror = reject;
    document.head.appendChild(styleSheet);
  });
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  })
}

function checkDepFiles(root) {

  let lastIndex = root.lastIndexOf('/', root.lastIndexOf('/') - 1);
  root = root.substring(0, lastIndex);

  const files = fs.readdirSync(root);
  const regex = new RegExp('Tempest', 'i');

  for (const file of files) {
    if (regex.test(file)) {
      let version = file.substring(file.indexOf('_') + 1);
      return [true,version];
    }
  }

  return false;
  // return fs.existsSync(rootFilePath);  
}

async function installFiles() {
  let rootFilePath;
  let masterFile;

  if (devVersion) {
    rootFilePath = tempDir;
    masterFile = path.join(__dirname, 'MASTERFILES.zip');
  }else {
    rootFilePath = userPath;
    const appPath = path.dirname(path.dirname(__dirname));
    masterFile = path.join(appPath, 'MASTERFILES.zip');
  }

  const zip = new AdmZip(masterFile);
  zip.extractAllTo(rootFilePath, true);

  let loadModal = document.getElementById('modal');
  loadModal.classList.add('disable');
  launchLoadScreen();
}

function launchTempest() {
  
  //LOADING THE MAIN PAGE
  let mainScript = document.createElement('script');
  mainScript.src = userPath + 'ApplicationSupport/scripts/main-page.js';
  document.body.appendChild(mainScript); //ADD BACK IN – FOR FULL APP

  let body = document.body;
  let mainApp = fs.readFileSync(userPath + 'ApplicationSupport/html/main-page.htm', 'utf8');
  body.innerHTML = mainApp;
}


async function loadContent() {

  console.log(dirLocation);

  //MAIN PAGE REPLACEMENT
  filePath = path.join(dirLocation, 'ApplicationSupport/html/main-page.htm');
  replacementMap = {
    "mccajoh3" : username
  }
  await replaceLines(filePath, replacementMap);

  //BRAND PAGE
  filePath = path.join(dirLocation, 'ApplicationSupport/html/templates/_brand-selection.htm');
  replacementMap = {
    "mccajoh3" : username
  }
  await replaceLines(filePath, replacementMap);

  //HTML PAGE
  filePath = path.join(dirLocation, 'ApplicationSupport/html/templates/_html-selection.htm');
  replacementMap = {
    "mccajoh3" : username
  }
  await replaceLines(filePath, replacementMap);

  //IMAGE PAGE
  filePath = path.join(dirLocation, 'ApplicationSupport/html/templates/_image-file-upload.htm');
  replacementMap = {
    "mccajoh3" : username
  }
  await replaceLines(filePath, replacementMap);

  //IMAGE PAGE
  filePath = path.join(dirLocation, 'ApplicationSupport/html/templates/doximity.htm');
  replacementMap = {
    "mccajoh3" : username
  }
  await replaceLines(filePath, replacementMap);

  //LOADING THE PAGE CONTENT
  let mainPage = fs.readFileSync(`${dirLocation}ApplicationSupport/html/main-page.htm`, 'utf-8');
  let body = document.body;
  
  //FIX MAIN PAGE
  
  body.innerHTML = mainPage; 
}




function replaceLines(filePath, replacementMap) {
  const content = fs.readFileSync(filePath, 'utf8');

  let modifiedContent = content;
  for (const line in replacementMap) {
    const escapedLine = line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(escapedLine, 'g');
    modifiedContent = modifiedContent.replace(pattern, replacementMap[line]);
  }

  fs.writeFileSync(filePath, modifiedContent);
}






//LOAD THE APP CONTENT
// document.addEventListener('DOMContentLoaded', async () => {
//   let depPath = document.getElementById('save-path');
//   depPath.dataset.path = `/Users/${username}/Documents`;
//   let body = document.body;

//   try {
//     await replaceStringInFiles(userPath, devName, username);
//     await loadBaseContent(body);
//     // Perform actions after both the string replacement and loadBaseContent are completed
//   } catch (error) {
//     console.error('An error occurred:', error);
//   }
// });




// async function delayOpen() {
//   await new Promise(resolve => setTimeout(resolve, 7000)); 
//   // $class(svgContainer,'svg-fade','add');
//   // $class(title,'title-fade','add');
// }





function replaceInFiles(directoryPath, searchString, replaceString) {
  const files = fs.readdirSync(directoryPath);

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      replaceInFiles(filePath, searchString, replaceString);
    } else {
      const fileExtension = path.extname(file).toLowerCase();
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif']; // Add more image extensions if needed

      if (!imageExtensions.includes(fileExtension)) {
        replaceInFile(filePath, searchString, replaceString);
      }
    }
  });
}

function replaceInFile(filePath, searchString, replaceString) {
  let fileContent = fs.readFileSync(filePath, 'utf-8');
  fileContent = fileContent.replace(new RegExp(searchString, 'g'), replaceString);
  fs.writeFileSync(filePath, fileContent, 'utf-8');
}


