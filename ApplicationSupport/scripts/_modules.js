//THIS SCRIPT CONTAINS DOCUMENT MODULES

//CONSOLE.lOG – $log()
function $log(arg) {
    return console.log(arg);
}

//DOCUMENT.GET - $get(#/.)
function $get(arg) {
    let name = arg.slice(1);
    if (arg.includes('#')) {
        return document.getElementById(name);
    };

}