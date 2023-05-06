//CURRENT
//TESTING


//BACKLOG
//general DOM styling (ongoing)
//edit settings(?)


//BUG(s) / FIXES NEEDED


//COMPLETE
//lock 'ADD SETTING' if Title and Sizes have not been filled out
//Hitting 'continue' no longer wipes the data
//add 'Default' as a non-deletable setting 
//adding a custom setting, sets the new setting to active
//1.9 release
//Single Page & Multi Page PDFs are created
//"PDF" complete alert works
//multiple PDFs are created!
//delete settings
//initial DOM build
//custom styles are added, selectable



//-- NOTES TO KEEP --
// localStorage.clear('captPDFSettings');
//npx electron-builder --x64  (to build for intel macs)
//npx electron-builder --mac (to build for silicon macs)  


//setting up the test environment
let mergeDate = '2/10';
if (env === 'test') {
  document.getElementById('heading').textContent = 'CaptPDF Testing ' + mergeDate;
};


//toggle the settings btn
const settingBtn = document.getElementById('setting-btn');
const toggle = document.getElementById('toggle-arrow');
const settingContent = document.getElementById('custom-settings');
const savedSettings = localStorage.getItem('captPDFSettings');
let load = true;
let flag = false;
let dSetting = document.getElementById('default-setting-001');
const holder = document.getElementById('drag');
drag.textContent = 'Drag HTML file here';

//DEFAULT VALUE
const defaultSetting = {
  ID : 'default-setting-001',
  title : 'Default',
  sizes : [375,800]
}

// ELECTRON VARIABLES
const fs = require('fs');
const PDFMerger = require('pdf-merger-js');


const label = document.getElementById('output-style-title');
const value = document.getElementById('output-style-sizes');

//HTML BLOB of saved setting
var userSettings = [];
userSettings.push(defaultSetting);
const outputSettings = {};

//setting Default Output Settings
outputSettings['filePath'] = '';



//ENABLE/DISABLE 'ADD SETTING BTN'
const saveSettingBtn = document.getElementById('save-setting-btn');
const settingTitleInput = document.getElementById('add-title');
const settingSizeInput = document.getElementById('add-value');

settingTitleInput.addEventListener('input',btnValidator);
settingSizeInput.addEventListener('input',btnValidator);

function btnValidator() {
  const validatorInputs = document.getElementsByClassName('input');
  if(Array.from(validatorInputs).every(checkValid)){
    saveSettingBtn.classList.remove('disabled');
  }else {
    saveSettingBtn.classList.add('disabled');
  }
  function checkValid(el) {
    return el.textContent.trim().length > 0;
  }
}


//check if user-settings exist
if (savedSettings) {
  userSettings = JSON.parse(savedSettings);
}else {
  userSettings = [];
  userSettings.push(defaultSetting);
}

//selecting 'default' on load

//BUILDING THE CUSTOM SETTINGS
const settingList = document.getElementById('custom-setting-list');

function addSetting(source) {
  const settingItem = document.createElement('div');
  settingItem.classList.add('setting-item');
  settingItem.id = source.ID;

  const settingTitle = document.createElement('div');
  settingTitle.classList.add('setting-title');
  settingTitle.textContent = source.title;

  const settingSizes = document.createElement('div');
  settingSizes.classList.add('setting-sizes');

  for (let val of source.sizes) {
    const sizeEl = document.createElement('div');
    sizeEl.classList.add('setting');
    sizeEl.textContent = val;
    settingSizes.appendChild(sizeEl);
  }

  const settingTools = document.createElement('div');
  settingTools.classList.add('edit-delete-container');
  
  const delBtn = document.createElement('div');
  delBtn.classList.add('tool-btn','delete');
  delBtn.id = 'delete-' + source.ID;
  delBtn.setAttribute('onclick','editSetting(this,"delete")');

  // settingTools.appendChild(editBtn);
  settingTools.appendChild(delBtn);

  settingItem.appendChild(settingTitle);
  settingItem.appendChild(settingSizes);
  if (settingItem.id != 'default-setting-001') {
    settingItem.appendChild(settingTools);
  }
  settingItem.setAttribute('onclick','setActiveSetting(this,event)');
  settingList.prepend(settingItem);

  dSetting = document.getElementById('default-setting-001');
  if (settingItem.id === 'default-setting-001') {
    settingList.prepend(settingItem);
  }else {
    dSetting.parentNode.insertBefore(settingItem,dSetting.nextSibling);
  }

  if (!load) {
    settingItem.click();
  }else if (!flag) {
    dSetting.click();
    flag = true;
  } 
}

function setActiveSetting(el,click) {
  if (click.target.classList.contains('tool-btn')) {
    return;
  }

  let toggle = false;

  let index = userSettings.findIndex(object => object.ID === el.id);

  const settingItems = document.getElementsByClassName('setting-item');
  if (el.classList.contains('setting-item-active')) {
    toggle = true;
  }
  for (let value of settingItems) {
    value.classList.remove('setting-item-active');
  }

  if (!toggle) {

    //updating the output settings
    let sizeObj = {...outputSettings};
    let key = userSettings[index].title.replace(/\s+/g, '-')
    delete sizeObj.outputSizes;
    sizeObj.outputSizes = {};

    //adding new settings from userSettings.sizes
    for (let value of userSettings[index].sizes) {
      sizeObj.outputSizes['_' + key + '-' + value] = value;
    }

    outputSettings.outputSizes = sizeObj.outputSizes;

    el.classList.add('setting-item-active');
    label.textContent = userSettings[index].title;
    value.textContent = userSettings[index].sizes.join(', ');
  }else {
      index = 0;
      dSetting.classList.add('setting-item-active');
      label.textContent = userSettings[index].title;
      value.textContent = userSettings[index].sizes.join(', ');
    }
}


function generateRandomKey() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";
  for (let i = 0; i < 10; i++) {
    key += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return key;
}

//ADDING THE CUSTOM SETTING
function createSetting() {
  const title = document.getElementById('add-title').textContent;
  const value = document.getElementById('add-value').textContent.split(',');
  
  const setting = {
    ID : generateRandomKey(),
    title : title,
    sizes : value
  };
  
  userSettings.push(setting);
  addSetting(setting);

  document.getElementById('add-title').textContent = '';
  document.getElementById('add-value').textContent = '';
  saveToLocal();
}

//EDIT or DELETE the SETTING
function editSetting(el,action) {
  const actionID = el.id.substr(el.id.indexOf('-')+1);
  const index = userSettings.findIndex(object => object.ID === actionID);
  if (action === 'delete') {
    userSettings.splice(index,1);
    dSetting.click();
  }else if (action === 'edit') {
  }
  saveToLocal();
  const parent = el.parentNode.parentNode;
  parent.remove();
  label.textContent = 'Default Settings';
  value.textContent = '375, 800';
}

loadSettings();

function loadSettings() {
  for (let val of userSettings) {
    addSetting(val);
  }
  load = false;
}


settingBtn.addEventListener('click', function() {
  toggle.classList.toggle('arrow-active');
  settingContent.classList.toggle('active-settings');
})

function saveToLocal() {
  localStorage.setItem('captPDFSettings',JSON.stringify(userSettings));
}

//DRAGGING
holder.ondragover = () => {
  return false;
};

holder.ondragleave = () => {
  return false;
};

holder.ondragend = () => {
  return false;
};

holder.ondrop = (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];

  const fileName = document.createElement('div');
  fileName.classList = 'drag-file-name';
  fileName.id = 'data-file-name';

  const filePath = document.createElement('div');
  filePath.classList = 'drag-file-path';
  filePath.id = 'data-file-path';

  fileName.textContent = file.name.substr(0,file.name.lastIndexOf('.'));
  filePath.textContent = file.path;
  outputSettings['filePath'] = file.path;

  holder.textContent = '';
  holder.appendChild(fileName);
  holder.appendChild(filePath);
  

  for (let value of document.getElementsByClassName('createBtn')) {
    value.classList.remove('disabled');
  }
  return false;
};

function makePDF(el) {
  var counter = 0;
  const { BrowserWindow } = require('@electron/remote');
  let action = el.id;
  const sizesToOutput = outputSettings.outputSizes;

  Object.keys(sizesToOutput).forEach((value) => {

    //build the browser window of specific sizes
    let win2 = new BrowserWindow({
      id: 'newWindow',
      width: sizesToOutput[value],
      height: 500,
      show: false,
      title: value
    });

    win2.loadFile(outputSettings.filePath);
    
    let pageHeight;
    win2.webContents.on('did-finish-load', () => {
      printPDF();
    });

    async function printPDF() {
      pageHeight = await
      win2.webContents.executeJavaScript('document.body.scrollHeight');

      const fullPath = outputSettings.filePath;
      const pathName = fullPath.substring(0, fullPath.lastIndexOf('.'));
      const outputPath = `${pathName}${value}`;
      const folderPath = fullPath.substring(0, fullPath.lastIndexOf('/'));

      const options = {
        filePath : outputPath + '.pdf',
        landscape: false,
        printBackground: true,
        margins: { left: 0, top: 0, right: 0, bottom: 0 },
        pageSize: {width: sizesToOutput[value]/96, height: (pageHeight + 25)/96 },
        unit: 'px',
        pageRanges: '1'
      }
  
      const pdfPath = options.filePath;
  
      win2.webContents.printToPDF(options)
      .then((data) => {
        fs.writeFile(pdfPath, data, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log('PDF saved successfully');
            win2.destroy();
            counter +=1;
            sendComplete(counter,action,folderPath);
          }
        });
      })
      .catch((error) => {
        console.log('Error: ' + error);
      });
    }
  });
};

function combinePDF() {

  let combinePDF = [];
  Object.keys(outputSettings.outputSizes).forEach((value) => {
    combinePDF.push(value);
  })

  const fullPath = outputSettings.filePath;
  const pathName = fullPath.substring(0, fullPath.lastIndexOf('.'));
  const docName = pathName.substring(fullPath.lastIndexOf('/')+1);
  const folderPath = fullPath.substring(0, fullPath.lastIndexOf('/')+1);
  const combined = folderPath + docName + '_All-Sizes.pdf';

  var merger = new PDFMerger();

  (async () => {
    for (let value of combinePDF) {
      await merger.add(folderPath + docName + value + '.pdf');
    }
    await merger.save(combined);
    for (let value of combinePDF) {
      toDelete = folderPath + docName + value + '.pdf';
      fs.unlink(toDelete, (err) => {
        if (err) {
            alert("An error ocurred updating the file" + err.message);
            console.log(err);
            return;
        }
        console.log("File succesfully deleted");
    });
    }
  })();
}


function sendComplete(counter,action,path) {
  const modalContent = document.getElementById('modal-success-content');
  const modalPath = path;

  modalContent.textContent = modalPath;
  if (counter == 2 && action === 'singlePagePDF') {
    combinePDF();
  };
  const messageContainer = document.getElementById('complete-message');
  const modalSettings = document.getElementById('custom-settings');
  messageContainer.style.display = 'block';
  setTimeout(() => {
    messageContainer.classList.add('message-after');
    modalSettings.classList.remove('active-settings');
  }, 20);
  
  
};

function closeModal() {
  console.log('wtf');
  const messageContainer = document.getElementById('complete-message');
  messageContainer.classList.remove('message-after');
  messageContainer.style.display = 'none';
  dSetting.click();
}