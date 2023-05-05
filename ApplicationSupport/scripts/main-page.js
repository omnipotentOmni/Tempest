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
    console.log('toggle');
    $class(el,'active','remove');
  }
}

//WINDOW CHOICES
function swapWindow(selection) {
  console.log(selection);
  let windows = $get('.header-item');

  for (let window of windows) {
    $class(window,'active','remove');
  }

  $class(selection,'active','add');
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
  console.log(name.clientWidth);
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