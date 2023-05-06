//THIS SCRIPT CONTAINS DOCUMENT MODULES

//----------------------------------------------------------CONSOLE.lOG – $log() - console.log()
function $log(arg) {
  return console.log(arg);
}

//----------------------------------------------------------DOCUMENT.GET - $get(parent,#/.) - document.get...
function $get(el, parent) {

  if (!parent) {
    parent = document;
  }

  let value;
  let type = el.substring(1, el);
  let elName = el.substring(1);

  if (type === '#') {
    value = parent.getElementById(elName);
  } else if (type === '.') {
    value = parent.getElementsByClassName(elName);
  } else {
    value = parent.getElementsByTagName(el);
  }
  return value;
}

//----------------------------------------------------------ADD - $add(CLASSNAME) - classList.add...
function $class(source,className,action) {
  return source.classList[action](className);
}
