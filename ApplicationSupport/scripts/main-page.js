//MAIN PAGE SCRIPT

//FINISHED
// – Template Type Selection
// – Page Switch
// – Brand Selection Brand Drop-Down List
// – Default Selection
// – Brand Selection Window
// – HTML Selection Window
// – DragDrop & Click to Upload **NEEDS WORK IN ELECTRON ENV**
// – IMAGE SELECTION WINDOW

//ON DECK
// – Doximity Alert (Desktop) Build
// – Build the Brand List
// – Save User Settings
// – Save Session Settings
// – Add for Saving Template

//BUGS
// – REMOVING AN IMAGE BY CLICKING 'FPO' DOES NOT UNLOAD THE IMAGE – needs to unload the file
// – HTML / IMAGE UPLOADS NEED TO BE CONFGIURED FOR ELECTRON

// const appPath = app.getAppPath();

//--------------------------------------------------------MAIN

//TEMPLATE SELECTION
const path = require('path');

const { ipcRenderer } = require('electron');
let dir = ipcRenderer.sendSync('get-dir-path');

let __dir = path.join(dir, 'Tempest');

let templateSelector = $get('#template-select');
let templateItem = $get('.templateBtn',templateSelector);

let activeWindow = '';

let sessionData = {
  "brand-selection" : {
    "brand" : "",
    "default" : false,
  },
  "html-selection" : {
    "Alert" : {
      "name" : "",
      "path" : ""
    },
    "Coversheet" : {
      "name" : "",
      "path" : ""
    }
  },
  "image-selection" : {
    "primary" : {
      "name" : "",
      "path" : "",
      "fpo" : true
    },
    "alternate" : []
  }
};

//alertnate images = [{name : '',path : ''}]

console.log(sessionData)

function templateType(el) {
  let toggle = false;
  if ($class(el,'active','contains')) {
    toggle = true;
  }
  for (let item of templateItem) {
    $class(item,'active','remove');
  }
  if (!toggle) {
    $class(el,'active','add');
  }else {
    $class(el,'active','remove');
  }
}

//WINDOW CHOICES
async function swapWindow(selection) {
  let windows = $get('.header-item');
  for (let window of windows) {
    $class(window, 'active', 'remove');
  }
  $class(selection, 'active', 'add');

  let windowTitle = selection.dataset.title;
  activeWindow = windowTitle;
  let xhr = new XMLHttpRequest();
  xhr.open('GET', `./templates/_${windowTitle}.htm`);
  xhr.responseType = 'text';

  const sendRequest = new Promise((resolve, reject) => {
    xhr.onload = function () {
      if (xhr.status === 200) {
        let parser = new DOMParser();
        let htmlDoc = parser.parseFromString(xhr.responseText, 'text/html');
        let htmlContent = htmlDoc.documentElement.innerHTML;

        let stage = $get('#template-main-content');
        stage.innerHTML = htmlContent;

        let functionName = selection.dataset.function;
        if (typeof window[functionName] === 'function') {
          window[functionName]();
        }
        resolve();
      } else {
        reject(new Error(`Error: ${windowTitle} did not load. Please contact Support.`));
      }
    };

    xhr.onerror = function () {
      reject(new Error('An error occurred while making the request.'));
    };

    xhr.send(); // Send the request
  });

  await sendRequest;

  if (windowTitle === 'brand-selection') {
    loadBrands();
  }
  loadSessionData();
}

//DRAG FILE UPLOAD
function htmlSelection() {
  let dragBox = $get('.drag-box');

  //OVERRIDING DEFAULT DRAG BEHAVIOR
  for (let item of dragBox) {
    ['drageneter','dragover','dragleave','drop'].forEach(eventName =>  {
      item.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      item.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      item.addEventListener(eventName, unhighlight, false);
    });

    item.addEventListener('drop', handleDrop, false);

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    function highlight() {
      $class(item,'active','add');
    };

    function unhighlight() {
      $class(item,'active','remove');
    };

    function handleDrop(e) { 
      e.preventDefault();

      const dt = e.dataTransfer.files;
      const file = dt[0];

      // let filePath = file.webkitRelativePath;

      // let fileInput = $get('#drag-file-input');

      // fileInput.files = e.dataTransfer.files;

      // fileInput.addEventListener('change', handleUpload, false);

      //ADD THE FILE UPLOAD DISPLAY
      uploadFile(item.parentElement,file);
      

      function handleUpload(event) {
        console.log(event);
      }


      // fileInput.files.onchange = function() {
      //   console.log('hello');
      //   console.log(fileInput.value);
      // }

      // const dt = e.dataTransfer;
      // const files = dt.files;

      // let filePath = files[0].path;
      // console.log(filePath);

      // handleFiles(files);
    };

    function handleFiles(files) {
      item.dataset.fileload = true;
      $class(item,'active','add');
      console.log(files);
    }
  }
}

//INPUT CLICK
function fileUploadInput(e) {
  let type = e.dataset.type;

  input = $get(`#${type}-upload-input`);
  input.click();

  input.addEventListener('change',handleUpload,false);

  function handleUpload(evt) {
    let file = evt.target.files[0];
    if (type.includes('image')) {
      buildImage(e.parentElement,file);
    }else {
      uploadFile(e.parentElement,file);
    }
    input.removeEventListener('change',handleUpload,false);

    if (activeWindow === 'html-selection') {
      setSessionData(type,file);
    };
  }
}

//UPLOAD FILE
function uploadFile(parent,file) {
  console.log('clicked');
  let fileUploadDisplay = $get('.file-upload-container',parent)[0];
  fileUploadDisplay.dataset.filePath = file.path;
  fileUploadDisplay.style.display = 'flex';
  let fileNameDisplay = $get('.file-upload-name',fileUploadDisplay)[0];
  fileNameDisplay.textContent = file.name;
}

//UNLOAD FILE
function unloadFile(el) {
  console.log('clicked'); //FOR BOTH HTML AND IMAGES
  let container = el.parentElement.parentElement;

  let root = container.parentElement;
  let input = $get('input',root)[0];

  if (input.files.length) {
    input.value = '';
  }
  container.style.display = 'none';

  if (activeWindow === 'html-selection') {
    let type = container.parentElement.id.substr(0,container.parentElement.id.indexOf('-'));
    type = type.charAt(0).toUpperCase() + type.slice(1);
    console.log(type);

    sessionData[activeWindow][type].name = '';
    sessionData[activeWindow][type].path = '';
    console.log(sessionData);
  };

  if (activeWindow === 'image-selection') {
    let type = input.id.substr(0,input.id.indexOf('-'));
    
    sessionData[activeWindow][type].name = '';
    sessionData[activeWindow][type].path = '';

    if (type === 'primary') {
      sessionData[activeWindow][type].fpo = true;
    }
  }
}

//BRAND DROPDOWN
function brandDropDown(icon) {
  let carrot = icon;
  let ddMenu = $get('#brand-selection-display');
  $class(carrot,'active','toggle');
  $class(ddMenu,'open','toggle');
}

function setBrand(brand) {
  let name = $get('#brand-selection-name');
  name.textContent = brand.textContent;

  brandDropDown($get('#brand-dd'));
  setSessionData('brand-select',brand.textContent);
}

//DEFAULT SELECTOR
function defaultSelection() {
  let slider = $get('#selection-slider');

  if ($class(slider,'non-active','contains')) {
    $class(slider,'non-active','remove');
    $class(slider,'active','add');
    setSessionData('default-slider',$class(slider,'active','contains'));
    
  }else {
    $class(slider,'non-active','add');
    $class(slider,'active','remove');
    setSessionData('default-slider',$class(slider,'active','contains'));
  }

  let slideParent = event.target.parentElement.parentElement.parentElement;
  if (slideParent.id.includes('image') && slider.classList.contains('active')) {
    let images = $get('.image-file-container',slideParent)[0];
    images.innerHTML = '';
  }
}

//ADD IMAGE TO WINDOW
function buildImage(parent,file) {
  console.log(parent,file);
  let type = parent.id.substr(0,parent.id.indexOf('-'));

  let fileWrapper = $get('.image-file-container',parent)[0];
  let newImage = document.createElement('div');
  newImage.classList = 'file-upload-container';

  var xhr = new XMLHttpRequest();
  xhr.open('GET', './templates/_image-file-upload.htm');
  xhr.responseType = 'document';

  xhr.onload = function() {
    if (xhr.status === 200) {
      var htmlContent = xhr.response.documentElement.outerHTML;
      newImage.innerHTML = htmlContent;
      let name = $get('.file-upload-name',newImage)[0];
      name.textContent = file.name;

      //FPO – FPO WAS REMOVED

      // if (parent.id.includes('primary')) {
      //   if (fileWrapper.innerHTML == '') {
      //     $get('#selection-button-base').click();
      //   }
      //   fileWrapper.innerHTML = '';
      // }

      fileWrapper.appendChild(newImage);
      setSessionData(type,file);
    }
  };

  xhr.send();
}

//DELETE IMAGE
function deleteImageFile(e) {
  let parent = e.parentElement.parentElement.parentElement.parentElement;
  e.parentElement.parentElement.remove();

  //FPO – FPO WAS REMOVED
  
  // if (parent.id.includes('primary')) {
  //   $get('#selection-button-base').click();
  // }

  unloadFile(e);
}


//OPEN PREVIEW
function previewImage(e) {

  let mask = $get('#window-mask');
  let previewWindow = $get('#image-preview-window');

  toggleMask(mask);
  if (previewWindow.style.display !== 'none') {
    previewWindow.style.display = 'none';
  }else {
    previewWindow.style.display = 'flex';
    let imageName = $get('.file-upload-name',e.parentElement)[0];
    let previewTitle = $get('#image-preview-header');
    previewTitle.textContent = imageName.textContent;
  }

  
}

function toggleMask(e) {
  $class(e,'hide-mask','toggle');
  $class(e,'show-mask','toggle');
}



//LOADING THE BRANDS
async function loadBrands() {

  //CREATING THE BRAND DATA (DROP DOWN)
  let brandData;
  try {
    const response = await fetch(`${__dir}/ApplicationData/BrandData/brand-list.json`);
    if (response.ok) {
      brandData = await response.json();
    } else {
      throw new Error('Error loading Brand Data');
    }
  } catch (error) {
    console.error('An error occured while loading Brand Data:', error);
  }

  //CREATING THE INDIVIDUAL DROP DOWN ITEMS
  let brandTemplate;
  try {
    let response = await fetch('../html/templates/_brand-item.htm');
    if (response.ok) {
      brandTemplate = await response.text();
    } else {
      throw new Error('Error loading Brand Template');
    }
  } catch (error) {
    console.error('An error occured loading in the template:', error);
  }

  //LOADING THE BRANDS INTO THE DD MENU
  let ddMenu = $get('#brand-dd-menu');
  for (let el of brandData) {
    const parser = new DOMParser();  //MAKE THIS A MODULE
    const serializer = new XMLSerializer();
      
      const parsedDocument = parser.parseFromString(brandTemplate, 'text/html');
      const htmlElement = parsedDocument.body;

      let newEl = htmlElement.firstChild;
      newEl.textContent = el.BrandName;

      ddMenu.appendChild(newEl);
  }
}


//SET SESSION DATA
function setSessionData(action,value) {
  let dataType = sessionData[activeWindow];
  let dataKey;
  if (activeWindow === 'brand-selection') { // SETTING THE DATA FOR BRAND-SELECTION
    
    if (action === 'brand-select') {
      dataKey = 'brand';
    };
    if (action === 'default-slider') {
      dataKey = 'default';
    };

    if (dataKey) {
      dataType[dataKey] = value;
    }

  };

  if (activeWindow === 'html-selection') { // SETTING THE DATA FOR HTML UPLOAD
    
    if (action === 'alert') {
      dataKey = 'Alert'
    };
    if (action === 'coversheet') {
      dataKey = 'Coversheet'
    };

    if (dataKey) {
      dataType[dataKey].name = value.name;
      dataType[dataKey].path = value.path;
    }
  }

  if (activeWindow === 'image-selection') {
    if (action === 'primary') {
      dataType.primary.name = value.name;
      dataType.primary.path = value.path;
      setSessionData('default-slider',false);
    };
    if (action === 'default-slider') {
      dataType.primary.fpo = value;
    };
  }
}



//LOAD AND APPLY SESSION DATA
function loadSessionData() {
  let data = sessionData[activeWindow];
  if (activeWindow === 'brand-selection') { //SETTING THE SESSION DATA FOR BRAND-SELECTION
    let brand = $get('#brand-selection-name');
    if (data.brand) {
      brand.textContent = sessionData[activeWindow].brand;
    }

    let slider = $get('#selection-slider');
    if (data.default) {
      $class(slider,'active','add');
      $class(slider,'non-active','remove');
    }
  }

  if(activeWindow === 'html-selection') { //SETTING THE SESSION DATA FOR HTML-UPLOADS
    let uploadTypes = ['Alert','Coversheet'];
    
    for (let i = 0; i < uploadTypes.length; i++) {
      let parent = $get(`#${uploadTypes[i].toLowerCase()}-upload`);
      if (data[uploadTypes[i]].path.length) {
        let uploadData = {
          path : data[uploadTypes[i]].path,
          name : data[uploadTypes[i]].name
        };
        uploadFile(parent,uploadData)
      }
    }
  }

  if(activeWindow === 'image-selection') {
    if (data.primary.name) {
      let parent = $get('#primary-image-upload');
      let primaryImage = {
        "name" : data.primary.name,
        "path" : data.primary.path
      };
      buildImage(parent,primaryImage);
    }
  }

}