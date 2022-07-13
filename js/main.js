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

  const newEntry = {
    entryId: cjData.nextEntryId,
    title: title.value,
    image: photourl.value,
    notes: notes.value
  };

  cjData.entries.unshift(newEntry);

  displayEntries(newEntry);

  cjData.nextEntryId += 1;

  $('#image-upload-input').src = _imagePlaceholderSrc;
  e.target.reset();
  navigateToEntriesCB();
};

const beforeUnloadCB = () => localStorage.setItem(_entryLocalStorageKey, JSON.stringify(cjData));

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

const displayEntries = singleEntry => {
  const entries = $('#entries');
  const entryArr = singleEntry ? [singleEntry] : cjData.entries;

  if (entryArr.length) {
    $('#no-entries').classList.add('hidden');
  } else {
    $('#no-entries').classList.remove('hidden');

  }

  entryArr.forEach(data => {
    const entry = entryGenerator(data);

    singleEntry ? entries.prepend(entry) : entries.append(entry);
  });
};

const navigateToEntryFormCB = () => {
  $('div[data-view="entries"]').classList.add('hidden');
  $('div[data-view="entry-form"]').classList.remove('hidden');
};

const navigateToEntriesCB = e => {
  if (e) e.preventDefault();

  $('div[data-view="entries"]').classList.remove('hidden');
  $('div[data-view="entry-form"]').classList.add('hidden');
};

// Main
const main = () => {
  attachListener('#image-input', 'input', imageInputCB);
  attachListener('#photourl-input', ['input', 'paste', 'change', 'keyup'], photoInputCB);
  attachListener('#create-form', 'submit', createFormCB);
  attachListener(null, 'beforeunload', beforeUnloadCB);
  attachListener('#entries-button', 'click', navigateToEntriesCB);
  attachListener('#entry-form-button', 'click', navigateToEntryFormCB);
  loadEntries();
  displayEntries();
};

// Initialization
window.addEventListener('DOMContentLoaded', main);
