// Global
let cjData = { ...data };
let _fileUploaded = false;
const _entryLocalStorageKey = 'codejournal';
const _imagePlaceholderSrc = 'images/placeholder-image-square.jpg';

// Utils
const $ = selector => document.querySelector(selector);

const $$ = selector => document.querySelectorAll(selector);

const isArray = value => Array.isArray(value);

const attachListener = (selector, type, cb, target) => {
  if (!selector) {
    window.addEventListener(type, cb);
  } else if (isArray(type)) {
    type.forEach(t => document.querySelector(selector).addEventListener(t, cb));
  } else if (target) {
    $$(target).forEach(t => t.querySelector(selector).addEventListener(type, cb));
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

const resetForm = () => {
  $('#image-upload-input').src = _imagePlaceholderSrc;
  $('#create-form').reset();
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

  resetForm();
  navigateTo(null, 'entires');
};

const beforeUnloadCB = () => localStorage.setItem(_entryLocalStorageKey, JSON.stringify(cjData));

const entryGenerator = entryObj => {
  const { title, image, notes, entryId } = entryObj;

  return generateElement({
    el: 'li',
    attribs: { class: 'entry', 'data-entry-id': entryId },
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
              {
                el: 'div',
                attribs: { class: ['flex', 'items-center', 'justify-between'] },
                children: [
                  { el: 'h3', attribs: { class: ['entry-heading', 'font-primary'] }, content: title },
                  {
                    el: 'a',
                    attribs: { href: '#' },
                    children: [
                      {
                        el: 'span',
                        attribs: { class: 'edit-icon' },
                        children: [
                          { el: 'i', attribs: { class: ['fa-solid', 'fa-pen'] } }
                        ]
                      }
                    ]
                  }
                ]
              },
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

const formTitleUpdater = view => {
  if (view === 'entry-form') $('#form-title').textContent = cjData.editing ? 'Edit Entry' : 'New Entry';
};

const navigateTo = (e, view) => {
  if (e) e.preventDefault();
  if (cjData.editing && view !== 'entry-form') {
    cjData.editing = null;
    resetForm();
  }
  formTitleUpdater(view);
  rememberView(view);
};

const prepopulateForm = () => {
  const { title, image, notes } = cjData.editing;

  $('#image-upload-input').src = image;
  $('#title-input').value = title;
  $('#photourl-input').value = image;
  $('#notes-input').value = notes;
};

const editIconClickCB = e => {
  const [parentElem] = e.path.filter(({ className }) => className === 'entry');
  const editEntryId = parseInt(parentElem.dataset.entryId);
  const [currentEntry] = cjData.entries.filter(({ entryId }) => entryId === editEntryId);

  cjData.editing = currentEntry;

  prepopulateForm();
  navigateTo(null, 'entry-form');
};

const rememberView = view => {
  cjData.view = view;
  $('div[data-view]').classList.add('hidden');
  $(`div[data-view="${view}"]`).classList.remove('hidden');
};

const loadView = () => {
  $(`div[data-view="${cjData.view}"]`).classList.remove('hidden');
  if (cjData.editing && cjData.view === 'entry-form') prepopulateForm();
  formTitleUpdater(cjData.view);
};

const attachEditListener = () => attachListener('.edit-icon', 'click', editIconClickCB, '.entry');

// Main
const main = () => {
  attachListener('#image-input', 'input', imageInputCB);
  attachListener('#photourl-input', ['input', 'paste', 'change', 'keyup'], photoInputCB);
  attachListener('#create-form', 'submit', createFormCB);
  attachListener(null, 'beforeunload', beforeUnloadCB);
  attachListener('#entries-button', 'click', e => navigateTo(e, 'entries'));
  attachListener('#entry-form-button', 'click', () => navigateTo(null, 'entry-form'));
  loadEntries();
  loadView();
  displayEntries();
  if (cjData.entries.length > 0) attachEditListener();
};

// Initialization
window.addEventListener('DOMContentLoaded', main);
