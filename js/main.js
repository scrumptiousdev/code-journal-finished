// Global
let cjData = { ...data };
let _fileUploaded = false;
const _entryLocalStorageKey = 'codejournal';
const _imagePlaceholderSrc = 'images/placeholder-image-square.jpg';

// Utils
const $ = selector => document.querySelector(selector);

const attachListener = (selector, type, cb) => {
  if (!selector) {
    window.addEventListener(type, cb);
  } else if (typeof type !== 'string') {
    type.forEach(t => document.querySelector(selector).addEventListener(t, cb));
  } else {
    document.querySelector(selector).addEventListener(type, cb);
  }
};

const imgCheck = src => {
  const img = new Image();

  img.src = src;

  return img.height > 0;
};

const loadFile = (file, cb = null) => {
  const fr = new FileReader();

  if (cb) fr.onload = () => cb(fr);
  fr.readAsDataURL(file);
};

const getBase64Image = img => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const dataURL = canvas.toDataURL('image/png');

  return dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
};

// Functions
const loadEntries = () => {
  const storedEntries = localStorage.getItem(_entryLocalStorageKey);

  if (storedEntries) cjData = JSON.parse(storedEntries);
};

const imageInputCB = ({ target: { files } }) => {
  if (files[0].type.indexOf('image') < 0) return;

  if (!_fileUploaded) {
    _fileUploaded = true;
    $('#photourl-input').value = 'UploadedImage.jpg';
  }

  loadFile(files[0], fr => {
    $('#image-upload-input').src = fr.result;
  });
};

const photoInputCB = ({ target: { value } }) => {
  if (_fileUploaded) {
    _fileUploaded = false;
    $('#image-input').value = null;
  }

  $('#image-upload-input').src = imgCheck(value) ? value : _imagePlaceholderSrc;
};

const createFormCB = e => {
  e.preventDefault();

  const { title, photourl, notes } = e.target.elements;

  cjData.entries.unshift({
    entryId: cjData.nextEntryId,
    title: title.value,
    image: _fileUploaded ? getBase64Image($('#image-upload-input')) : photourl.value,
    notes: notes.value
  });

  cjData.nextEntryId += 1;

  $('#image-upload-input').src = _imagePlaceholderSrc;
  e.target.reset();
};

const beforeUnloadCB = () => localStorage.setItem(_entryLocalStorageKey, JSON.stringify(cjData));

// Main
const main = () => {
  attachListener('#image-input', 'input', imageInputCB);
  attachListener('#photourl-input', ['input', 'paste'], photoInputCB);
  attachListener('#create-form', 'submit', createFormCB);
  attachListener(null, 'beforeunload', beforeUnloadCB);
  loadEntries();
};

// Initialization
window.addEventListener('DOMContentLoaded', main);
