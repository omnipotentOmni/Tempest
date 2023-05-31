const escapeStringRegexp = require('escape-string-regexp');
const archiver = require('archiver');

function sendToProd() { // UPLOAD FILE CHANGES TO PROD

  devVersion = false;

  console.log(dir);

  let devDir = __dir;
  let prodDir = path.join(os.homedir(), 'Documents/Tempest');
  let distDir = path.join(dir, 'Tempest_Dist');
  let prodExclude = [
    '.git',
    '.gitignore',
    'icon.icns',
    'index.js',
    'node_modules',
    'package-lock.json',
    'package.json',
    'README.md',
    '.DS_Store',
    'app-page.htm',
    'loadReqs.js',
    'buildProd.js',
    'MASTERFILES.zip'
  ];

  let distExclude = [
    '.git',
    '.gitignore',
    'node_modules', //if this gets modified, has to be copied manually
    '.DS_Store',
    'README.md',
    'ApplicationData',
    'ApplicationSupport'
  ]

  const sourcePath = [
    devDir + '/ApplicationData',
    devDir + '/ApplicationSupport'
  ];

  const zipPath = devDir + '/MASTERFILES.zip';

  createZipFile(sourcePath, zipPath)
  .then(() => {
    console.log('Zip File Created');
  })
  .catch(error => {
    console.error('An error ocurred: ', error);
  });


  if (fs.existsSync(prodDir)) {
    fs.removeSync(prodDir);
    console.log('Directory Deleted Successfully');
  }

  fs.mkdirSync(prodDir);

  function copyDirectory(source, destination, excludedItems) {
    fs.ensureDirSync(destination);
    const items = fs.readdirSync(source);

    for (const item of items) {
      const itemPath = path.join(source, item);
      const destinationPath = path.join(destination, item);

      if (excludedItems.includes(item) || excludedItems.includes(itemPath)) {
        continue;
      }

      if (fs.statSync(itemPath).isDirectory()) {
        copyDirectory(itemPath, destinationPath, excludedItems); // Recursively copy directories
      } else {
        fs.copyFileSync(itemPath, destinationPath); // Copy files
      }
    }
  }

  try {
    copyDirectory(devDir, prodDir, prodExclude);
    console.log('Dev copied to Prod');
  } catch (error) {
    console.error(error);
  }

  try {
    copyDirectory(devDir, distDir, distExclude);
    console.log('Dev copied to Dist');
  } catch (error) {
    console.error(error);
  }


  function replaceLines(filePath, replacementMap) {
    const content = fs.readFileSync(filePath, 'utf8');

    let modifiedContent = content;
    for (const line in replacementMap) {
      const escapedLine = escapeStringRegexp(line);
      const pattern = new RegExp(escapedLine, 'g');
      modifiedContent = modifiedContent.replace(pattern, replacementMap[line]);
    }

    fs.writeFileSync(filePath, modifiedContent);
  }

  // Usage example
  let filePath = path.join(prodDir, 'ApplicationSupport/scripts/main-page.js');
  let replacementMap = {
    "let dir = ipcRenderer.sendSync('get-dir-path');": '',
    "let __dir = path.join(dir, 'Tempest');": `let __dir = '${prodDir}';`,
    "./": `${prodDir}/`
  };

  replaceLines(filePath, replacementMap);

  filePath = path.join(distDir, 'index.js');
  replacementMap = {
    "'./ApplicationSupport/html/main-page.htm'": `'${prodDir}/ApplicationSupport/html/main-page.htm'`
  };

  replaceLines(filePath, replacementMap);

  filePath = path.join(distDir, 'app-page.htm');
  replacementMap = {
    '"./ApplicationSupport/css/styles.css"': `"${prodDir}/ApplicationSupport/css/styles.css"`,
    '"./ApplicationSupport/scripts/_modules.js"': `"${prodDir}/ApplicationSupport/scripts/_modules.js"`,
    '<script src="./ApplicationSupport/scripts/buildProd.js"></script>': ''
  };

  replaceLines(filePath, replacementMap);

  filePath = path.join(distDir, 'loadReqs.js');
  replacementMap = {
    "./ApplicationSupport/html/main-page.htm": `${prodDir}/ApplicationSupport/html/main-page.htm`,
    "./ApplicationSupport/scripts/main-page.js": `${prodDir}/ApplicationSupport/scripts/main-page.js`,
    "let devVersion = true;": 'let devVersion = false;'
  };

  replaceLines(filePath, replacementMap);

  filePath = path.join(prodDir, 'ApplicationSupport/html/main-page.htm');
  console.log(filePath);
  replacementMap = {
    "./": `${prodDir}/`
  }

  replaceLines(filePath, replacementMap);

  filePath = path.join(prodDir, 'ApplicationSupport/html/templates/_brand-selection.htm');
  replacementMap = {
    "./": `${prodDir}/`
  }

  replaceLines(filePath, replacementMap);

  filePath = path.join(prodDir, 'ApplicationSupport/html/templates/_image-file-upload.htm');
  replacementMap = {
    "./": `${prodDir}/`
  }

  replaceLines(filePath, replacementMap);


  filePath = path.join(prodDir, 'ApplicationSupport/html/templates/doximity.htm');
  replacementMap = {
    "./": `${prodDir}/`
  }

  replaceLines(filePath, replacementMap);

  filePath = path.join(prodDir, 'ApplicationSupport/html/templates/_html-selection.htm');
  replacementMap = {
    "./": `${prodDir}/`
  }

  replaceLines(filePath, replacementMap);



  //MAKING A ZIP OF THE FILE STRUCTURE
  function createZipFile(source, exportPath) {
    const output = fs.createWriteStream(exportPath);
    const archive = archiver('zip', {
      zlib: {
        level: 9
      }
    });

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        resolve();
      });

      archive.on('warning', err => {
        if (err.code === 'ENOENT') {
          console.warn('Warning:', err);
        } else {
          reject(err);
        }
      });

      archive.on('error', err => {
        reject(err);
      });

      archive.pipe(output);

      source.forEach(sourcePath => {
        archive.directory(sourcePath, path.basename(sourcePath));
      });

      archive.finalize();
    });
  };

  alert('Did you copy NodeModules?')



};