// eslint-disable-next-line import/extensions
import { translations, supportedLangs } from './i18n.js';

// Функция для получения текущего языка из localStorage
function getCurrentLang() {
  return localStorage.getItem('lang') || 'ru';
}

// Функция для создания элемента select с языками
function createLangSelect(owner) {
  const langSelect = document.createElement('select');
  langSelect.classList.add('custom-select', 'border', 'border-primary', 'shadow', 'mb-3', 'px-3', 'py-1', 'font-weight-bold');

  // Заполняем элемент select языками
  supportedLangs.forEach((lang) => {
    const option = document.createElement('option'); // Создаем элемент option
    option.value = lang.code; // Устанавливаем значение value
    option.textContent = `🌐 ${lang.label}`; // Устанавливаем текстовое содержимое

    if (lang.code === getCurrentLang()) option.selected = true; // Устанавливаем язык из localStorage
    langSelect.append(option); // Добавляем элемент option в select
  });

  // Обработчик события изменения языка
  langSelect.addEventListener('change', (e) => {
    e.preventDefault();
    const selectedLang = e.target.value; // Получаем выбранный язык из элемента select
    localStorage.setItem('lang', selectedLang); // Сохраняем выбранный язык в localStorage
    document.documentElement.lang = selectedLang; // Устанавливаем атрибут lang у html элемента

    // eslint-disable-next-line no-use-before-define
    setAppNavText(); // Создаем текст навигации

    document.querySelector('h2').innerHTML = translations[selectedLang][`title_${owner}`] || translations[selectedLang].title_my;
    document.querySelector('input').placeholder = translations[selectedLang].addPlaceholder; // Изменяем плейсхолдер в поле ввода
    document.querySelector('button').textContent = translations[selectedLang].addButton; // Изменяем текст кнопки добавления

    document.querySelectorAll('.btn-success').forEach((btn) => { // Изменяем текст кнопки "Готово"
      btn.textContent = translations[selectedLang].doneButton;
    });

    document.querySelectorAll('.btn-danger').forEach((btn) => {
      btn.textContent = translations[selectedLang].deleteButton;
    });

    document.querySelectorAll('.btn-group').forEach((btnGroup) => {
      btnGroup.querySelector('button').textContent = translations[selectedLang].doneButton;
      btnGroup.querySelectorAll('button')[1].textContent = translations[selectedLang].deleteButton;
    });
  });

  // Обработчик события загрузки страницы
  document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('lang') || 'ru';
    document.documentElement.lang = savedLang;
    langSelect.value = savedLang;
    document.body.prepend(langSelect); // Добавляем элемент select в начало body
  });

  return langSelect; // Возвращаем элемент select
}

createLangSelect();

// Функция для создания текста навигации
function setAppNavText() {
  const lang = getCurrentLang();
  const t = translations[lang];
  const navLinks = [
    { id: 'nav-my-link', key: 'title_my' },
    { id: 'nav-mom-link', key: 'title_mom' },
    { id: 'nav-dad-link', key: 'title_dad' },
  ];
  navLinks.forEach((link) => {
    const el = document.getElementById(link.id);
    if (el) el.textContent = t[link.key];
  });
}

// Функция для создания заголовка приложения
function createAppTitle(owner) {
  const lang = getCurrentLang();
  const t = translations[lang];
  const appTitle = document.createElement('h2');
  appTitle.innerHTML = t[`title_${owner}`] || t.title_my;

  return appTitle;
}

function createTodoItemForm() {
  const lang = getCurrentLang();
  const t = translations[lang];
  const form = document.createElement('form');
  const input = document.createElement('input');
  const buttonWrapper = document.createElement('div');
  const button = document.createElement('button');

  form.classList.add('input-group', 'mb-3');
  input.classList.add('form-control');
  input.placeholder = t.addPlaceholder;
  buttonWrapper.classList.add('input-group-append');
  button.classList.add('btn', 'btn-primary', 'disabled');
  button.textContent = t.addButton;

  buttonWrapper.append(button);
  form.append(input);
  form.append(buttonWrapper);

  input.addEventListener('input', (e) => {
    e.preventDefault();
    if (input.value.length) {
      button.classList.remove('disabled');
    }
  });

  return {
    form,
    input,
    button,
  };
}

function createTodoList() {
  const list = document.createElement('ul');
  list.classList.add('list-group');

  return list;
}

function createTodoItemElement(todoItem, { onDone, onDelete }) {
  const lang = getCurrentLang();
  const t = translations[lang];
  const doneClass = 'list-group-item-success';
  const item = document.createElement('li');
  const buttonGroup = document.createElement('div');
  const doneButton = document.createElement('button');
  const deleteButton = document.createElement('button');

  item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
  item.textContent = todoItem.name;
  item.setAttribute('data-id', todoItem.id);

  if (todoItem.done) {
    item.classList.add(doneClass);
  }

  buttonGroup.classList.add('btn-group', 'btn-group-sm');
  doneButton.classList.add('btn', 'btn-success');
  doneButton.textContent = t.doneButton;
  deleteButton.classList.add('btn', 'btn-danger');
  deleteButton.textContent = t.deleteButton;

  buttonGroup.append(doneButton);
  buttonGroup.append(deleteButton);
  item.append(buttonGroup);

  doneButton.addEventListener('click', () => {
    item.classList.toggle(doneClass, todoItem.done);
    onDone({ todoItem, element: item });
  });

  deleteButton.addEventListener('click', () => {
    if (confirm(t.confirmDelete)) {
      onDelete({ todoItem, element: item });
      item.remove();
    }
  });

  return item;
}

async function createTodoApp(container, {
  owner,
  todoItemList = [],
  onCreateFormSubmit,
  onDoneClick,
  onDeleteClick,
}) {
  setAppNavText();
  const todoAppTitle = createAppTitle(owner); // используем owner напрямую
  const todoItemForm = createTodoItemForm();
  const todoList = createTodoList();

  const handlers = {
    onDone: async ({ todoItem, element }) => {
      await onDoneClick({
        id: todoItem.id,
        owner,
        done: !todoItem.done,
      });
      todoItem.done = !todoItem.done;
      element.classList.toggle('list-group-item-success', todoItem.done);
    },
    onDelete: async ({ todoItem, element }) => {
      await onDeleteClick({
        id: todoItem.id,
        owner,
      });
      element.remove();
    },
  };

  container.append(todoAppTitle);
  container.append(todoItemForm.form);
  container.append(todoList);

  todoItemList.forEach((todoItem) => {
    const todoItemElement = createTodoItemElement(todoItem, handlers);
    todoList.append(todoItemElement);
  });

  todoItemForm.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!todoItemForm.input.value) {
      return;
    }
    const todoItem = await onCreateFormSubmit({
      owner,
      name: todoItemForm.input.value.trim(),
      done: false,
    });
    const todoItemElement = createTodoItemElement(todoItem, handlers);
    todoList.append(todoItemElement);
    todoItemForm.input.value = '';
  });
}

export default createTodoApp;
