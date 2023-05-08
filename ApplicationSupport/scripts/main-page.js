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
// – Build the Brand List
// – Save User Settings

//BUGS
// – HTML / IMAGE UPLOADS NEED TO BE CONFGIURED FOR ELECTRON



//--------------------------------------------------------MAIN

//TEMPLATE SELECTION

let templateSelector = $get('#template-select');
let templateItem = $get('.templateBtn',templateSelector);

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
function swapWindow(selection) {

  //SET THE HEADERS
  let windows = $get('.header-item');

  for (let window of windows) {
    $class(window,'active','remove');
  }

  $class(selection,'active','add');

  //LOAD IN THE CONTENT
  let windowTitle = selection.dataset.title;
  var xhr = new XMLHttpRequest();

  xhr.open('GET',`./templates/_${windowTitle}.htm` );
  xhr.responseType = 'document';

  xhr.onload = function() {
    if (xhr.status === 200) {

      var htmlContent = xhr.response.documentElement.outerHTML;
      let stage = $get('#template-main-content');
      
      stage.innerHTML = htmlContent;

      //LOAD WINDOW SPECIFIC SCRIPTS
      let functionName = selection.dataset.function;
      if (typeof window[functionName] === 'function') {
        window[functionName]();
      }

    }else {
      alert(`error, ${windowTitle}, did not load. Please contact Support.`);
    }
  };

  xhr.send();

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
  }
}

//UPLOAD FILE
function uploadFile(parent,file) {
  let fileUploadDisplay = $get('.file-upload-container',parent)[0];  
  fileUploadDisplay.style.display = 'flex';
  let fileNameDisplay = $get('.file-upload-name',fileUploadDisplay)[0];
  fileNameDisplay.textContent = file.name;
}

//UNLOAD FILE
function unloadFile(el) {
  let container = el.parentElement.parentElement;
  let root = container.parentElement;
  let input = $get('input',root)[0];

  if (input.files.length) {
    input.value = '';
  }
  container.style.display = 'none';
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
}

//DEFAULT SELECTOR
function defaultSelection() {
  let slider = $get('#selection-slider');

  if ($class(slider,'non-active','contains')) {
    $class(slider,'non-active','remove');
    $class(slider,'active','add');
  }else {
    $class(slider,'non-active','add');
    $class(slider,'active','remove');
  }

  let slideParent = event.target.parentElement.parentElement.parentElement;
  if (slideParent.id.includes('image') && slider.classList.contains('active')) {
    let images = $get('.image-file-container',slideParent)[0];
    images.innerHTML = '';
  }
}

//ADD IMAGE TO WINDOW
function buildImage(parent,file) {

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

      if (parent.id.includes('primary')) {
        if (fileWrapper.innerHTML == '') {
          $get('#selection-button-base').click();
        }
        fileWrapper.innerHTML = '';
      }

      fileWrapper.appendChild(newImage);

      
    }
  };

  xhr.send();
}

//DELETE IMAGE
function deleteImageFile(e) {
  let parent = e.parentElement.parentElement.parentElement.parentElement;
  e.parentElement.parentElement.remove();

  if (parent.id.includes('primary')) {
    $get('#selection-button-base').click();
  }

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