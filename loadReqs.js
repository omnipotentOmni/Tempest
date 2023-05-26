const path = require('path');
var fs = require('fs-extra');
const PDFMerger = require('pdf-merger-js');
const { ipcRenderer } = require('electron');
const os = require('os');

//LOAD THE APP CONTENT
document.addEventListener('DOMContentLoaded', () => {
  let body = document.body;

  //LOADING THE BODY CONTENT
  let mainPage = fs.readFileSync('./ApplicationSupport/html/main-page.htm', 'utf-8');
  body.innerHTML = mainPage;

  //LOADING THE MAIN SCRIPT
  let script = document.createElement('script');
  script.src = './ApplicationSupport/scripts/main-page.js';

  body.appendChild(script);
});