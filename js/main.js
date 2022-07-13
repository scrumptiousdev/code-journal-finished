// Global
let cjData = { ...data };
let _fileUploaded = false;
const _entryLocalStorageKey = 'codejournal';
const _imagePlaceholderSrc = 'images/placeholder-image-square.jpg';

// Utils
const $ = selector => document.querySelector(selector);

const isArray = value => Array.isArray(value);

const attachListener = (selector, type, cb) => {
  if (!selector) {
    window.addEventListener(type, cb);
  } else if (isArray(type)) {
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

// Functions
const loadEntries = () => {
  const storedEntries = localStorage.getItem(_entryLocalStorageKey);

  if (storedEntries) cjData = JSON.parse(storedEntries);
};

const imageInputCB = ({ target: { files } }) => {
  if (files[0].type.indexOf('image') < 0) return;

  _fileUploaded = true;

  loadFile(files[0], fr => {
    $('#image-upload-input').src = fr.result;
    $('#photourl-input').value = fr.result;
  });
};

const photoInputCB = ({ target: { value } }) => {
  $('.input-error').textContent = '';

  if (_fileUploaded) {
    _fileUploaded = false;
    $('#image-input').value = null;
  }

  $('#image-upload-input').src = imgCheck(value) ? value : _imagePlaceholderSrc;
};

const createFormCB = e => {
  e.preventDefault();

  const { title, photourl, notes } = e.target.elements;

  $('.input-error').textContent = '';

  if (!_fileUploaded && !imgCheck(photourl.value)) {
    $('.input-error').textContent = '(Invalid photo URL)';
    return;
  }

  cjData.entries.unshift({
    entryId: cjData.nextEntryId,
    title: title.value,
    image: photourl.value,
    notes: notes.value
  });

  cjData.nextEntryId += 1;

  $('#image-upload-input').src = _imagePlaceholderSrc;
  e.target.reset();
};

const beforeUnloadCB = () => localStorage.setItem(_entryLocalStorageKey, JSON.stringify(cjData));

const generateElement = ({ el, attribs, content, children }) => {
  const element = document.createElement(el);

  if (attribs) {
    for (const attrib in attribs) {
      const value = attribs[attrib];

      if (attrib === 'class') {
        isArray(value) ? value.forEach(v => element.classList.add(v)) : element.classList.add(value);
      } else {
        element.setAttribute(attrib, value);
      }
    }
  }

  if (content) element.textContent = content;

  if (children && children.length > 0) {
    children.forEach(c => {
      const childElem = generateElement(c);
      element.append(childElem);
    });
  }

  return element;
};

const entryGenerator = entryObj => {
  const { title, image, notes } = entryObj;

  return generateElement({
    el: 'li',
    attribs: { class: 'entry' },
    children: [
      {
        el: 'div',
        attribs: { class: 'row' },
        children: [
          {
            el: 'div',
            attribs: { class: 'column-half' },
            children: [{ el: 'img', attribs: { class: 'entry-img', src: image, alt: `${title} image` } }]
          },
          {
            el: 'div',
            attribs: { class: 'column-half' },
            children: [
              { el: 'h3', attribs: { class: ['entry-heading', 'font-primary'] }, content: title },
              { el: 'p', content: notes }
            ]
          }
        ]
      }
    ]
  });
};

const displayEntries = () => {
  const entries = $('#entries');

  cjData.entries.forEach(data => {
    const entry = entryGenerator(data);

    entries.append(entry);
  });
};

// Main
const main = () => {
  attachListener('#image-input', 'input', imageInputCB);
  attachListener('#photourl-input', ['input', 'paste', 'change', 'keyup'], photoInputCB);
  attachListener('#create-form', 'submit', createFormCB);
  attachListener(null, 'beforeunload', beforeUnloadCB);
  loadEntries();
  displayEntries();
};

// Initialization
window.addEventListener('DOMContentLoaded', main);
