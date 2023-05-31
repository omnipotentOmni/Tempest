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


//SWAP USERNAME

//TEMPLATE SELECTION
let dir = ipcRenderer.sendSync('get-dir-path');

let __dir = path.join(dir, 'Tempest');

let templateSelector = $get('#template-select');
let templateItem = $get('.templateBtn', templateSelector);

let activeWindow = '';

let sessionData = {
  "template-selection": {
    "type": ""
  },
  "brand-selection": {
    "brand": "",
    "default": false,
  },
  "html-selection": {
    "alert": {
      "name": "",
      "path": ""
    },
    "coversheet": {
      "name": "",
      "path": ""
    }
  },
  "image-selection": {
    "primary": {
      "name": "",
      "path": "",
      "fpo": true
    },
    "alternate": []
  }
};

function testingEnv() {
  sessionData = {
    "template-selection": {
      "type": "doximity"
    },
    "brand-selection": {
      "brand": "Vaxneuvance",
      "default": false
    },
    "html-selection": {
      "alert": {
        "name": "Doximity Alert_US-MMR-00003.html",
        "path": "/Users/mccajoh3/Desktop/US-MMR-00003/Doximity Alert_US-MMR-00003.html"
      },
      "coversheet": {
        "name": "Title sheet_US-MMR-00003.html",
        "path": "/Users/mccajoh3/Desktop/US-MMR-00003/Title sheet_US-MMR-00003.html"
      }
    },
    "image-selection": {
      "primary": {
        "name": "image-test.jpeg",
        "path": "/Users/mccajoh3/Desktop/US-MMR-00003/image-test.jpeg"
      },
      "alternate": [{
          "id": "alternate-image-8oe78wmhoc",
          "name": "image-test copy.jpeg",
          "path": "/Users/mccajoh3/Desktop/US-MMR-00003/image-test copy.jpeg"
        },
        {
          "id": "alternate-image-t664z4ycc4",
          "name": "image-test copy 2.jpeg",
          "path": "/Users/mccajoh3/Desktop/US-MMR-00003/image-test copy 2.jpeg"
        }
      ]
    }
  }
  checkData();
  $get('#submit-btn').click();
}

console.log(sessionData)

function templateType(el) {
  let templateData = $get('#template-data');
  let toggle = false;
  if ($class(el, 'active', 'contains')) {
    toggle = true;
  }
  for (let item of templateItem) {
    $class(item, 'active', 'remove');
    sessionData['template-selection'].type = '';
    $class(templateData, 'disable', 'add');
  }
  if (!toggle) {
    $class(el, 'active', 'add');
    sessionData['template-selection'].type = el.dataset.type;
    $class(templateData, 'disable', 'remove');
  } else {
    $class(el, 'active', 'remove');
    sessionData['template-selection'].type = '';
    $class(templateData, 'disable', 'add');
  }
  checkData();
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
  xhr.open('GET', `${dirLocation}ApplicationSupport/html/templates/_${windowTitle}.htm`);
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
    ['drageneter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
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
      $class(item, 'active', 'add');
    };

    function unhighlight() {
      $class(item, 'active', 'remove');
    };

    function handleDrop(e) {
      let type = e.target.dataset.type;
      console.log(e.target);
      console.log('drop');
      e.preventDefault();

      const dt = e.dataTransfer.files;
      const file = dt[0];

      //ADD THE FILE UPLOAD DISPLAY
      uploadFile(item.parentElement, file);

      setSessionData(type, file);
    };

    function handleFiles(files) {
      console.log('needed too?');
      item.dataset.fileload = true;
      $class(item, 'active', 'add');
      console.log(files);
    }
  }
}

//INPUT CLICK
function fileUploadInput(e) {
  let type = e.dataset.type;

  input = $get(`#${type}-upload-input`);
  input.click();

  input.addEventListener('change', handleUpload, false);

  function handleUpload(evt) {
    let file = evt.target.files[0];
    if (activeWindow === 'image-selection') {
      let el = evt.target.id;
      let type = el.substr(0, el.indexOf('-'));
      file.id = $genKey(`${type}-image-`);
    }
    if (type.includes('image')) {
      buildImage(e.parentElement, file);
    } else {
      uploadFile(e.parentElement, file);
    }
    input.removeEventListener('change', handleUpload, false);

    if (activeWindow === 'html-selection') {
      setSessionData(type, file);
    };
  }
}

//UPLOAD FILE
function uploadFile(parent, file) {
  let fileUploadDisplay = $get('.file-upload-container', parent)[0];
  fileUploadDisplay.dataset.filePath = file.path;
  fileUploadDisplay.style.display = 'flex';
  let fileNameDisplay = $get('.file-upload-name', fileUploadDisplay)[0];
  fileNameDisplay.textContent = file.name;
}

//UNLOAD FILE
function unloadFile(el) {
  let container = el.parentElement.parentElement;

  let root;

  if (activeWindow === 'html-selction') {
    root = container.parentElement;
  };

  if (activeWindow === 'image-selection') {
    let type = container.id.substr(0, container.id.indexOf('-'));
    root = $get(`#${type}-image-upload`);
  }

  let input = $get('input', root)[0];

  if (input.files.length) {
    input.value = '';
  }
  container.style.display = 'none';

  if (activeWindow === 'html-selection') {
    let type = container.parentElement.id.substr(0, container.parentElement.id.indexOf('-'));

    sessionData[activeWindow][type].name = '';
    sessionData[activeWindow][type].path = '';
  };

  if (activeWindow === 'image-selection') {

    let primaryContainer = $get('#primary-image-upload');
    let primaryImage = $get('.image-file-container', primaryContainer)[0];
    let altImageContainer = $get('#alternate-image-upload');
    if (!primaryImage.innerHTML) {
      $class(altImageContainer, 'disable', 'add');
    } else {
      $class(altImageContainer, 'disable', 'remove');
    }

    let type = input.id.substr(0, input.id.indexOf('-'));
    let data = sessionData[activeWindow][type];

    if (type === 'primary') {
      data.name = '';
      data.path = '';
      data.fpo = true;
    };

    if (type === 'alternate') {
      let imgDelete = container.id;
      const indexToRemove = data.findIndex(obj => obj.name === imgDelete);

      data.splice(indexToRemove, 1);
    }
  }
  checkData();
}

//BRAND DROPDOWN
function brandDropDown(icon) {
  let carrot = icon;
  let ddMenu = $get('#brand-selection-display');
  $class(carrot, 'active', 'toggle');
  $class(ddMenu, 'open', 'toggle');
}

function setBrand(brand) {
  let name = $get('#brand-selection-name');
  name.textContent = brand.textContent;

  brandDropDown($get('#brand-dd'));
  setSessionData('brand-select', brand.textContent);
}

//DEFAULT SELECTOR
function defaultSelection() {
  let slider = $get('#selection-slider');

  if ($class(slider, 'non-active', 'contains')) {
    $class(slider, 'non-active', 'remove');
    $class(slider, 'active', 'add');
    setSessionData('default-slider', $class(slider, 'active', 'contains'));

  } else {
    $class(slider, 'non-active', 'add');
    $class(slider, 'active', 'remove');
    setSessionData('default-slider', $class(slider, 'active', 'contains'));
  }

  let slideParent = event.target.parentElement.parentElement.parentElement;
  if (slideParent.id.includes('image') && slider.classList.contains('active')) {
    let images = $get('.image-file-container', slideParent)[0];
    images.innerHTML = '';
  }
}

//ADD IMAGE TO WINDOW
function buildImage(parent, file, reload) {

  let type = parent.id.substr(0, parent.id.indexOf('-'));



  let fileWrapper = $get('.image-file-container', parent)[0];
  let newImage = document.createElement('div');
  newImage.classList = 'file-upload-container';
  newImage.id = file.id;

  var xhr = new XMLHttpRequest();
  xhr.open('GET', `${dirLocation}ApplicationSupport/html/templates/_image-file-upload.htm`);
  xhr.responseType = 'document';

  xhr.onload = function () {
    if (xhr.status === 200) {
      var htmlContent = xhr.response.documentElement.outerHTML;
      newImage.innerHTML = htmlContent;
      let name = $get('.file-upload-name', newImage)[0];
      name.textContent = file.name;

      if (activeWindow === 'image-selection' && !sessionData[activeWindow][type].length) {
        fileWrapper.innerHTML = '';
      }
      fileWrapper.appendChild(newImage);

      if (!reload) {
        setSessionData(type, file);
      }
    }
  };

  xhr.send();
}

//DELETE IMAGE
function deleteImageFile(e) {
  e.parentElement.parentElement.remove();

  unloadFile(e);
}


//OPEN PREVIEW
function previewImage(e) {

  let mask = $get('#window-mask');
  let previewWindow = $get('#image-preview-window');

  toggleMask(mask);
  if (previewWindow.style.display !== 'none') {
    previewWindow.style.display = 'none';
  } else {
    previewWindow.style.display = 'flex';
    let imageName = $get('.file-upload-name', e.parentElement)[0];
    let previewTitle = $get('#image-preview-header');
    previewTitle.textContent = imageName.textContent;
  }


}

function toggleMask(e) {
  $class(e, 'hide-mask', 'toggle');
  $class(e, 'show-mask', 'toggle');
}



//LOADING THE BRANDS
async function loadBrands() {
  //CREATING THE BRAND DATA (DROP DOWN)
  let brandData;
  try {
    const response = await fetch(`${dirLocation}ApplicationData/BrandData/brand-list.json`);
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
    let response = await fetch(`${dirLocation}ApplicationSupport/html/templates/_brand-item.htm`);
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
    const parser = new DOMParser(); //MAKE THIS A MODULE

    const parsedDocument = parser.parseFromString(brandTemplate, 'text/html');
    const htmlElement = parsedDocument.body;

    let newEl = htmlElement.firstChild;
    newEl.textContent = el.BrandName;

    ddMenu.appendChild(newEl);
  }
}


//SET SESSION DATA
function setSessionData(action, value) {
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
    console.log(action,value);
    dataKey = action;

    if (dataKey) {
      dataType[dataKey].name = value.name;
      dataType[dataKey].path = value.path;
    }
  }

  if (activeWindow === 'image-selection') {

    let primaryContainer = $get('#primary-image-upload');
    let primaryImage = $get('.image-file-container', primaryContainer)[0];
    let altImageContainer = $get('#alternate-image-upload');
    if (!primaryImage.innerHTML) {
      $class(altImageContainer, 'disable', 'add');
    } else {
      $class(altImageContainer, 'disable', 'remove');
    }

    if (action === 'primary') {
      dataType.primary.name = value.name;
      dataType.primary.path = value.path;
      setSessionData('default-slider');
    };
    if (action === 'default-slider') {
      dataType.primary.fpo = value;
    };
    if (action === 'alternate') {
      let img = {
        "id": value.id,
        "name": value.name,
        "path": value.path
      };
      dataType.alternate.push(img);
    }
  }
  checkData();
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
      $class(slider, 'active', 'add');
      $class(slider, 'non-active', 'remove');
    }
  }

  if (activeWindow === 'html-selection') { //SETTING THE SESSION DATA FOR HTML-UPLOADS
    let uploadTypes = ['alert', 'coversheet'];

    for (let i = 0; i < uploadTypes.length; i++) {
      let parent = $get(`#${uploadTypes[i].toLowerCase()}-upload`);
      if (data[uploadTypes[i]].path.length) {
        let uploadData = {
          path: data[uploadTypes[i]].path,
          name: data[uploadTypes[i]].name
        };
        uploadFile(parent, uploadData)
      }
    }
  }

  if (activeWindow === 'image-selection') {

    let altImageContainer = $get('#alternate-image-upload');
    if (!data.primary.name) {
      $class(altImageContainer, 'disable', 'add');
    } else {
      $class(altImageContainer, 'disable', 'remove');
    }

    if (data.primary.name) {
      let parent = $get('#primary-image-upload');
      let primaryImage = {
        "name": data.primary.name,
        "path": data.primary.path
      };
      buildImage(parent, primaryImage, true);
    };
    if (data.alternate.length) {
      let parent = $get('#alternate-image-upload');
      for (let el of data.alternate) {
        let image = {
          "id": el.id,
          "name": el.name,
          "path": el.path
        };
        buildImage(parent, image, true);
      }
    }
  }
  checkData();
}


//CHECK TO SEE IF REQUIRED ELEMENTS ARE FILLED IN
function checkData() {
  let btn = $get('#submit-btn');

  //CHECK ALERT TYPE – an alert type IS required
  let alert = sessionData['template-selection'].type;

  //CHECK BRAND – brand IS required
  let brand = sessionData['brand-selection'].brand;
  let brandIcon = $get('#icon-brand');

  if (brand.length) {
    brandIcon.dataset.complete = 'Complete'
    $class(brandIcon, 'complete', 'add');
  } else {
    brandIcon.dataset.complete = 'Missing'
    $class(brandIcon, 'complete', 'remove');
  }

  //CHECK HTML – alert & coversheet ARE required
  let alertHTML = sessionData['html-selection'].alert.name;
  let coversheetHTML = sessionData['html-selection'].coversheet.name;
  let htmlIcon = $get('#icon-html');

  if (alertHTML && coversheetHTML) {
    htmlIcon.dataset.complete = 'Complete'
    $class(htmlIcon, 'complete', 'add');
  } else {
    htmlIcon.dataset.complete = 'Missing'
    $class(htmlIcon, 'complete', 'remove');
  }

  //CHECK IMAGES – images are optional, Primary image will show as "FPO" if not selected
  let primaryImage = sessionData['image-selection'].primary.name;
  let alternateImage = sessionData['image-selection'].alternate; //IS AN ARRAY AND WILL NEED TO ITERATE THROUGH
  let imageIcon = $get('#icon-image');

  if (primaryImage) {
    $class(imageIcon, 'complete', 'add');
    if (alternateImage.length) {
      imageIcon.dataset.complete = 'Primary & Alt Image Loaded';
    } else {
      imageIcon.dataset.complete = 'Primary Image Loaded';
    }
  } else {
    $class(imageIcon, 'complete', 'remove');
    imageIcon.dataset.complete = 'No Images Selected';
  }

  if (alert && brand.length && alertHTML && coversheetHTML) {
    $class(btn, 'disable', 'remove');
  } else {
    $class(btn, 'disable', 'add');
  }
}




async function buildTemplate() {
  let html = $get('#main-html');
  let htmlContent;

  let xhr = new XMLHttpRequest();
  xhr.open('GET', `${dirLocation}ApplicationSupport/html/templates/doximity.htm`);
  xhr.responseType = 'text';

  const sendRequest = new Promise((resolve, reject) => {
    xhr.onload = function () {
      if (xhr.status === 200) {
        let parser = new DOMParser();
        let htmlDoc = parser.parseFromString(xhr.responseText, 'text/html');
        htmlContent = htmlDoc.documentElement.innerHTML;

        html.innerHTML = htmlContent;

        resolve();
      } else {
        reject(new Error(`Error: Template did not load. Please contact Support.`));
      }
    };

    xhr.onerror = function () {
      reject(new Error('An error occurred while making the request.'));
    };

    xhr.send(); // Send the request
  });

  await sendRequest;
  ipcRenderer.send('resize-window');

  // ----------- PROCESS UPLOADED TITLES
  let alertTitles = [];
  for (let title of gatherTitles()) {
    alertTitles.push(title.textContent);
  }
  let titleContainer = $get('#title-options');
  let primaryTitle = $get('#preview-title');
  primaryTitle.textContent = alertTitles[0];
  for (let title of alertTitles) {
    titleContainer.appendChild(processTitles(title));
  }

  // ----------- PROCESS UPLOADED IMAGES
  processImages();

  // ----------- APPLY SELECTED BRAND
  let brand = getBrand();
  let brandChip = $get('#alert-brand-chip');

  let img = document.createElement('img');
  img.src = `${dirLocation}ApplicationData/BrandData/brand-chips/${brand['BrandChips'].mobile}`;
  console.log(img.src);
  brandChip.appendChild(img);

  // ----------- ADD IFRAME

  let frame = $get('#alert-display');
  frame.src = sessionData['html-selection'].alert.path;

  frame.addEventListener('load', () => {
    let iframeContainer = frame.contentWindow.document.getElementById('campaign-alert-container');
    iframeContainer.style.paddingBottom = '0px';
    let contentHeight = frame.contentWindow.document.body.scrollHeight;
    frame.style.height = contentHeight + 'px';

    let title = frame.contentWindow.document.getElementsByTagName('h1')[0];
    title.style.border = '1px solid red';
    title.style.margin = '-5px';
    title.style.padding = '5px';

  });
}

ipcRenderer.send('resize-window-default');





function gatherTitles() {
  let data = sessionData['html-selection'].coversheet.path;
  let csData = fs.readFileSync(data, {
    encoding: 'utf8',
    flag: 'r'
  });
  const parser = new DOMParser();
  const doc = parser.parseFromString(csData, 'text/html');
  const csTitles = doc.querySelectorAll('.body_copy');
  return csTitles;
}

function processTitles(data) {
  let url = fs.readFileSync(`${dirLocation}ApplicationSupport/html/templates/_title-item.htm`);
  let parser = new DOMParser();
  let doc = parser.parseFromString(url, 'text/html');

  let titleBlob = $get('.title-item', doc)[0];
  let titleText = $get('.alert-title', titleBlob)[0];
  let titleChar = $get('.alert-char-count', titleBlob)[0].getElementsByTagName('span')[0];

  titleText.textContent = data;
  titleChar.textContent = data.length;

  return titleBlob;
}

function processImages() {
  let data = sessionData['image-selection'];

  //getting the primary image
  let primaryImage = $get('#preview-image');
  if (data.primary.fpo) {
    $class(primaryImage, 'fpo', 'add');
  } else {
    let image = document.createElement('img');
    image.src = data.primary.path;
    primaryImage.appendChild(image);
  }

  //getting alternate images
  if (data.alternate.length) {
    $class(primaryImage, 'variable-container', 'add');
    $class(primaryImage, 'blue', 'add');
    let alternateImages = $get('#header-options');
    alternateImages.appendChild(buildAltImage(data.primary.path));

    for (let el of data.alternate) {
      alternateImages.appendChild(buildAltImage(el.path));
    };

    function buildAltImage(path) {
      let imageContainer = document.createElement('div');
      imageContainer.classList = 'variable-image-item';
      let img = document.createElement('img');
      img.src = path;
      imageContainer.appendChild(img);

      return imageContainer;
    }
  } else {
    let altContainer = $get('#alert-image-options');
    altContainer.style.display = 'none';
  };
}

//GETTING THE BRAND
function getBrand() {
  let brandMaster = JSON.parse(fs.readFileSync(`${dirLocation}ApplicationData/BrandData/brand-list.json`));
  let selectedBrand = sessionData['brand-selection'].brand;



  return brandMaster.find(obj => obj.BrandName === selectedBrand);
}



//-------------------------------------------------------- TEMPLATE
function switchView(type, el) {
  let currentActive = $get('.active-view')[0];
  let targetView = el;

  if (currentActive) {
    $class(currentActive, 'active-view', 'remove');
  };
  $class(targetView, 'active-view', 'add');

  let body = document.getElementsByTagName('body')[0];
  let content = $get('#container-main');


  body.classList = type;
  content.classList = type;

  //UPDATING THE HEIGHT OF THE IFRAME
  let frame = $get('#alert-display');
  let contentHeight = frame.contentWindow.document.body.scrollHeight;
  frame.style.height = contentHeight + 'px';

  //SWAPPING OUT THE IMAGE
  let brandChip = $get('#alert-brand-chip').getElementsByTagName('img')[0];
  let brand = getBrand();
  brandChip.src = `${dirLocation}ApplicationData/BrandData/brand-chips/${brand['BrandChips'][type]}`;
}


async function exportPDF() {
  let controls = $get('#template-controls');
  controls.style.opacity = '0'
  let docPath = path.dirname(sessionData['html-selection'].alert.path); // THE FILEPATH FOR THE PDF
  let fileName = docPath.substring(docPath.lastIndexOf('/') + 1);

  async function sendPrintToPdf(pdfOptions) {
    return new Promise((resolve) => {
      ipcRenderer.once('print-to-pdf-done', () => {
        resolve();
      });

      ipcRenderer.send('print-to-pdf', pdfOptions);
    });
  }

  async function generatePDFsSequentially(views, index, options) {
    if (index >= views.length) {
      views[0].click();
      console.log('All PDFs generated successfully');
      combinePDF(options);
      return;
    }

    const view = views[index];
    view.click();
    const type = view.dataset.view;

    let pageWidth = document.body.scrollWidth;
    let pageHeight = document.body.scrollHeight;

    const pdfOption = {
      fileName: fileName,
      filePath: `${docPath}/${fileName}-${type}.pdf`,
      landscape: false,
      printBackground: true,
      margins: {
        right: .1,
        bottom: .1,
        top: 0,
        left: .1
      },
      pageSize: {
        width: pageWidth / 96,
        height: pageHeight / 96
      },
      unit: 'px',
      pageRanges: '1'
    };

    await sendPrintToPdf(pdfOption);

    console.log(`PDF generated: ${pdfOption.filePath}`);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    generatePDFsSequentially(views, index + 1, pdfOption);
  }

  function startPDFGeneration() {
    const views = $get('.template-control-icon');
    const initialIndex = 0;

    generatePDFsSequentially(views, initialIndex);
  }

  // Call the function to start generating all PDFs
  startPDFGeneration();
}



function combinePDF(options) {
  let controls = $get('#template-controls');
  controls.style.opacity = '1';

  let filePath = options.filePath.substring(0, options.filePath.lastIndexOf('/') + 1);
  console.log(filePath);

  let pdfs = [];
  pdfs.push(filePath + options.fileName + '-mobile.pdf');
  pdfs.push(filePath + options.fileName + '-desktop.pdf');

  console.log(pdfs);

  let combined = filePath + options.fileName + '.pdf';
  var merger = new PDFMerger();

  (async () => {
    for (let value of pdfs) {
      console.log(value);
      await merger.add(value);
    }
    await merger.save(combined);

    for (let value of pdfs) {
      let toDelete = value;
      console.log('delete');
      fs.unlink(toDelete, (err) => {
        if (err) {
          alert('An error occurred while deleting the files: ' + err.message);
          console.log(err);
          return;
        }
        console.log('Files removed');
      });
    }
  })();
  alert('PDF been been created!')
}