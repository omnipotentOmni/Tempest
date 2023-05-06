//MAIN PAGE SCRIPT

//FINISHED
// – Template Type Selection
// – Page Switch
// – Brand Selection Brand Drop-Down List
// – Default Selection

//ON DECK
// – Build the Brand List
// – Save User Settings
// – Save Pages as 'Templates'

//BUGS



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

      let filePath = file.webkitRelativePath;

      let fileInput = $get('#drag-file-input');

      console.log(fileInput,fileInput.value);

      fileInput.files = e.dataTransfer.files;

      fileInput.addEventListener('change', handleUpload, false);

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

//BRAND DROPDOWN
function brandDropDown(close) {
  if (!close) {
    let carrot = event.target.parentElement;
    let ddMenu = $get('#brand-selection-display');
    $class(carrot,'active','toggle');
    $class(ddMenu,'open','toggle');
  }
}

function setBrand(brand) {
  let name = $get('#brand-selection-name');
  name.textContent = brand.textContent;
}


//DEFAULT SELECTOR
function defaultSelection() {
  let slider = event.target;

  if ($class(slider,'non-active','contains')) {
    $class(slider,'non-active','remove');
    $class(slider,'active','add');
  }else {
    $class(slider,'non-active','add');
    $class(slider,'active','remove');
  }
}