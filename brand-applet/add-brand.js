async function getJSON() {
  return fetch('../ApplicationData/BrandData/brand-list.json')
      .then((response)=>response.json())
      .then((responseJson)=>{return responseJson});
}

async function caller() {
  json = await this.getJSON();  
  return json;
}
  
brandList = caller();

function display(el) {
  let radioBtn = Array.from(document.getElementsByClassName('input-radio'));

  radioBtn.forEach(function(btn) {
    btn.classList.remove('active');
  })

  console.log(el);
  el.classList.add('active');
}

function piMedGuide(el) {
  el.classList.toggle('active');
}

let brandData = [];
async function addBrand() {
  

  // try {
  //   const response = await fetch(`../ApplicationData/BrandData/brand-list.json`);
  //   if (response.ok) {
  //     brandData = await response.json();
  //   } else {
  //     throw new Error('Error loading Brand Data');
  //   }
  // } catch (error) {
  //   console.error('An error occured while loading Brand Data:', error);
  // }

  let brandName = document.getElementById('brandName').textContent;
  let chipName = document.getElementById('chipName').textContent.toUpperCase();

  let piMedGuideElements = [
    {
      "pi": {
        "bool": true,
        "pos": 1
      }
    },
    {
      "medGuide": {
        "bool": true,
        "pos": 0
      }
    }
  ];

  let piOption = document.getElementById('pi');
  let medGuideOption = document.getElementById('med-guide');

  if (!piOption.classList.contains('active')) {
    piMedGuideElements[0].pi.bool = false;
    piMedGuideElements[0].pi.pos = 0;
  }

  if (!medGuideOption.classList.contains('active')) {
    piMedGuideElements[1].medGuide.bool = false;
    piMedGuideElements[1].medGuide.pos = 0;
  }

  let piRadioBtn = document.getElementById('pi-radio');
  let mgRadioBtn = document.getElementById('mg-radio');

  if (piRadioBtn.classList.contains('active')) {
    piMedGuideElements[0].pi.pos = 1;
  }

  if (mgRadioBtn.classList.contains('active')) {
    piMedGuideElements[0].medGuide.pos = 1;
  }

  let newBrand = {
    "BrandName" : brandName,
    "BrandChips" : {
      "mobile" : `doximity_mobile_${chipName}.png`,
      "desktop" : `doximity_desktop_${chipName}.png`
    },
    "PiMedGuide" : {
      "Medication Guide" : [piMedGuideElements[0].pi.bool, piMedGuideElements[0].pi.pos],
      "Prescribing Info" : [piMedGuideElements[1].medGuide.bool, piMedGuideElements[1].medGuide.pos],
    }
  }

  brandData.push(newBrand);

  console.log(brandData);

  brandData.sort((a, b) => {
    const brandNameA = a.BrandName.toLowerCase();
    const brandNameB = b.BrandName.toLowerCase();
    if (brandNameA < brandNameB) {
      return -1;
    }
    if (brandNameA > brandNameB) {
      return 1;
    }
    return 0;
  });

  console.log(chipName);
  document.getElementById('brandName').textContent = '';
  document.getElementById('chipName').textContent = '';

  piOption.classList.add('active');
  medGuideOption.classList.add('active');

  display(document.getElementById("mg-radio-option"));
  display(document.getElementById("pi-radio-option"));

  let addMore = document.getElementById('continue');
  if (!addMore.classList.contains('active')) {
    saveJSON(brandData);
  }
}


function saveJSON(el) {
  const jsonData = JSON.stringify(el, null, 2);

  // Create a Blob object with the JSON data
  const blob = new Blob([jsonData], { type: 'application/json' });

  // Create a download link
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = 'brand-list.json';

  // Add the download link to the document body
  document.body.appendChild(downloadLink);

  // Programmatically trigger the download
  downloadLink.click();

  // Remove the download link from the document body
  document.body.removeChild(downloadLink);
}

function addMore(el) {
  el.classList.toggle('active');
}