//THIS SCRIPT CONTAINS DOCUMENT MODULES

//----------------------------------------------------------CONSOLE.lOG – $log() - console.log()
function $log(arg) {
  return console.log(arg);
}

//----------------------------------------------------------DOCUMENT.GET - $get(parent,#/.) - document.get...
function $get(arg,source) {
  if (!source) {
    source = document;
  }
  let type = arg[0];
  let name = arg.slice(1);
  if (type === '.') {
    return source.getElementsByClassName(name);
  }else if (type === '#') {
    return source.getElementById(name);
  }
}