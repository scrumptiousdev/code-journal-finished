// Global
let fileUploaded = false;

// Utils
const $ = selector => document.querySelector(selector);

const attachListener = (selector, type, cb) => document.querySelector(selector).addEventListener(type, cb);

const imgCheck = src => {
  const img = new Image();

  img.src = src;

  return img.height > 0;
};

// Functions
const imageInputCB = ({ target: { files } }) => {
  if (!fileUploaded) {
    fileUploaded = true;
    $('#photourl-input').value = 'UploadedImage.jpg';
  }

  const fr = new FileReader();

  fr.onload = () => $('#image-upload-input').setAttribute('src', fr.result);
  fr.readAsDataURL(files[0]);
};

const photoInputCB = ({ target: { value } }) => {
  if (fileUploaded) {
    fileUploaded = false;
    $('#image-input').value = null;
  }

  $('#image-upload-input').setAttribute('src', imgCheck(value) ? value : 'images/placeholder-image-square.jpg');
};

// Main
const main = () => {
  attachListener('#image-input', 'input', imageInputCB);
  attachListener('#photourl-input', 'input', photoInputCB);
};

// Initialization
window.addEventListener('DOMContentLoaded', main);
