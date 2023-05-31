const path = require('path');
var fs = require('fs-extra');
const PDFMerger = require('pdf-merger-js');
const { ipcRenderer, app } = require('electron');
const os = require('os');
const AdmZip = require('adm-zip');

let devVersion = true;
let devName = 'mccajoh3';

let dirLocation = './';
let username;
let userPath;
let tempDir;

if (!devVersion) {
  console.log('dist');
  username = os.userInfo().username;
  userPath = `/Users/${username}/Documents/Tempest/`;
  dirLocation = userPath;
  
}else {
  username = os.userInfo().username;
  userPath = `./`;

  //TEMP DIR
  tempDir = `/Users/${username}/Documents/Tempest/`;
}




//LOAD THE APP CONTENT
document.addEventListener('DOMContentLoaded', async () => {  

  launchLoadScreen();

  // loadContent(); //ADD BACK IN – FOR FULL APP
});

async function launchLoadScreen() {

  let progress = document.getElementById('progress');
  let svgContainer = document.getElementById('svg-container');
  let svg = fs.readFileSync('./loader-image.htm', 'utf-8');
  svgContainer.innerHTML = svg;

  await loadReqFiles('loading required modules');
  await delay(2000);
  progress.dataset.action = 'Contacting Skynet';
  await delay(500);
  await loadDependencies('Checking for Dependencies');
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function loadDependencies(action) {
  progress.dataset.action = action;
  let rootFilePath;
  if (devVersion) {
    rootFilePath = tempDir;
  }else {
    rootFilePath = userPath;
  }

  let depFiles = checkDepFiles(rootFilePath);
  if (!depFiles[0]) {
    await delay(2000);
    progress.dataset.action = 'Installing Dependencies';
    let loadModal = document.getElementById('modal');
    let loadAction = document.getElementById('modal-header');
    let loadPath = document.getElementById('save-path');
    let loadBtn = document.getElementById('modal-btn');
    loadAction.dataset.action = "Install Support Files to: ";
    loadPath.dataset.path = rootFilePath;
    loadBtn.dataset.action = "Install Files";
    loadModal.classList.remove('disable');
  }else {
    await delay(2000);
    progress.dataset.action = 'Launching Tempest';
    await delay(3000);
    launchTempest();
  }
}

async function loadReqFiles(action) {
  progress.dataset.action = action;

  const styleSheetPromise = loadStyleSheet(userPath + 'ApplicationSupport/css/styles.css');
  const modulesPromise = loadScript(userPath + 'ApplicationSupport/scripts/_modules.js');

  await Promise.all([styleSheetPromise, modulesPromise]);

  await delay(1000);
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
  if (devVersion) {
    rootFilePath = tempDir;
  }else {
    rootFilePath = userPath;
  }

  let masterFile = './MASTER-FILES.zip';

  const zip = new AdmZip(masterFile);
  zip.extractAllTo(rootFilePath, true);

  let loadModal = document.getElementById('modal');
  loadModal.classList.add('disable');
  progress.dataset.action = 'Launching Tempest';
  await delay(3000);
  launchTempest();
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




function replaceStringInFiles(dirPath, searchString, replacementString) {
  console.log('replacing-running');
  // Read the contents of the directory
  fs.readdir(dirPath, (error, files) => {
    if (error) {
      console.error('Error reading directory:', error);
      return;
    }

    // Iterate over each file
    files.forEach((file) => {
      const filePath = path.join(dirPath, file);

      // Check if the current path is a directory
      fs.stat(filePath, (error, stats) => {
        if (error) {
          console.error('Error retrieving file stats:', error);
          return;
        }

        if (stats.isDirectory()) {
          // Recursively process subdirectories
          replaceStringInFiles(filePath, searchString, replacementString);
        } else {
          // Process files
          fs.readFile(filePath, 'utf8', (error, data) => {
            if (error) {
              console.error('Error reading file:', error);
              return;
            }

            // Replace the string in file contents
            const updatedData = data.replace(new RegExp(searchString, 'g'), replacementString);

            // Write the updated contents back to the file
            fs.writeFile(filePath, updatedData, 'utf8', (error) => {
              if (error) {
                console.error('Error writing file:', error);
              }
            });
          });
        }
      });
    });
  });
}



