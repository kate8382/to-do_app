function createAppTitle(title) {
  const appTitle = document.createElement('h2');
  appTitle.innerHTML = title;

  return appTitle;
}

function createTodoItemForm() {
  const form = document.createElement('form');
  const input = document.createElement('input');
  const buttonWrapper = document.createElement('div');
  const button = document.createElement('button');

  form.classList.add('input-group', 'mb-3');
  input.classList.add('form-control');
  input.placeholder = 'Введите название нового дела';
  buttonWrapper.classList.add('input-group-append');
  button.classList.add('btn', 'btn-primary', 'disabled');
  button.textContent = 'Добавить дело';

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
  doneButton.textContent = 'Готово';
  deleteButton.classList.add('btn', 'btn-danger');
  deleteButton.textContent = 'Удалить';

  buttonGroup.append(doneButton);
  buttonGroup.append(deleteButton);
  item.append(buttonGroup);

  doneButton.addEventListener('click', () => {
    item.classList.toggle(doneClass, todoItem.done); // Переключение класса doneClass
    onDone({ todoItem, element: item }); // Вызов функции onDone с объектом todoItem и элементом item
  });

  deleteButton.addEventListener('click', () => {
    if (confirm('Вы уверены?')) {
      onDelete({ todoItem, element: item }); // Вызов функции onDelete с объектом todoItem и элементом item
      item.remove(); // Удаление элемента из DOM
    }
  });

  return item;
}

async function createTodoApp(container, {
  title,
  owner,
  todoItemList = [],
  onCreateFormSubmit,
  onDoneClick, // обработчик события на кнопку "Готово"
  onDeleteClick, // обработчик события на кнопку "Удалить"
}) {
  // Вызов раннее созданных функций
  const todoAppTitle = createAppTitle(title);
  const todoItemForm = createTodoItemForm();
  const todoList = createTodoList();

  const handlers = {
    onDone: async ({ todoItem, element }) => {
      await onDoneClick({
        id: todoItem.id,
        owner,
        done: !todoItem.done,
      });
      todoItem.done = !todoItem.done; // Изменение состояния done
      element.classList.toggle('list-group-item-success', todoItem.done); // Переключение класса doneClass
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

  // Получение списка дел
  todoItemList.forEach((todoItem) => {
    const todoItemElement = createTodoItemElement(todoItem, handlers);
    todoList.append(todoItemElement);
  });

  todoItemForm.form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Проверка на пустое значение
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

    // обнуляем значение в поле, чтобы не пришлось его стирать вручную
    todoItemForm.input.value = '';
  });
}

export default createTodoApp;
