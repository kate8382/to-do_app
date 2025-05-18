const API_URL = 'http://localhost:3000/api/todos';

async function fetchWithFallback(url, options, fallback, onSuccess) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error('Server error');
    const data = await response.json();
    if (onSuccess) onSuccess(data);
    return data;
  } catch (e) {
    return fallback();
  }
}

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
    onDone({ id: todoItem.id, todoItem, element: item }); // Вызов функции onDone с объектом todoItem и элементом item
  });

  deleteButton.addEventListener('click', () => {
    if (confirm('Вы уверены?')) {
      onDelete({ id: todoItem.id, todoItem, element: item }); // Вызов функции onDelete с объектом todoItem и элементом item, id
      item.remove();
    }
  });

  return item;
}

async function createTodoApp(container, { title, owner }) {
  // Вызов раннее созданных функций
  const todoAppTitle = createAppTitle(title);
  const todoItemForm = createTodoItemForm();
  const todoList = createTodoList();

  const handlers = {
    onDone({ todoItem, id, element }) {
      const newDone = !todoItem.done;
      fetchWithFallback(
        `${API_URL}/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ done: newDone }),
        },
        () => {
          const data = localStorage.getItem(owner) || '[]';
          const todos = JSON.parse(data);
          const todo = todos.find((item) => item.id === id);
          if (todo) todo.done = newDone;
          localStorage.setItem(owner, JSON.stringify(todos));
          element.classList.toggle('list-group-item-success', newDone);
          return todo;
        },
        (updatedTodo) => {
          const data = localStorage.getItem(owner) || '[]';
          const todos = JSON.parse(data);
          const todo = todos.find((item) => item.id === id);
          if (todo) todo.done = updatedTodo.done;
          localStorage.setItem(owner, JSON.stringify(todos));
          element.classList.toggle('list-group-item-success', updatedTodo.done);
        },
      );
    },

    onDelete({ id }) {
      return fetchWithFallback(
        `${API_URL}/${id}`,
        { method: 'DELETE' },
        () => { // Если сервер недоступен, мы удаляем задачу из localStorage вручную
          const data = localStorage.getItem(owner) || '[]';
          let todos = JSON.parse(data);
          todos = todos.filter((item) => item.id !== id);
          localStorage.setItem(owner, JSON.stringify(todos));
          return { message: 'deleted' };
        },
        () => { // Если сервер доступен, удаляем задачу из localStorage
          const data = localStorage.getItem(owner) || '[]';
          let todos = JSON.parse(data);
          todos = todos.filter((item) => item.id !== id);
          localStorage.setItem(owner, JSON.stringify(todos));
        },
      );
    },
  };

  // Добавление элементов в контейнер
  container.append(todoAppTitle);
  container.append(todoItemForm.form);
  container.append(todoList);

  // Получение списка дел
  const todoItemList = await fetchWithFallback(
    `${API_URL}?owner=${owner}`,
    { method: 'GET' },
    () => {
      const data = localStorage.getItem(owner) || '[]';
      return JSON.parse(data);
    },
    (data) => {
      // Сохраняем актуальный список в localStorage
      localStorage.setItem(owner, JSON.stringify(data));
    },
  );

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

    const todoItem = await fetchWithFallback(
      API_URL,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, owner }),
      },
      () => {
        const data = localStorage.getItem(owner) || '[]';
        const todos = JSON.parse(data);
        const newTodo = {
          id: Date.now().toString(),
          name,
          owner,
          done: false,
        };
        todos.push(newTodo);
        localStorage.setItem(owner, JSON.stringify(todos));
        return newTodo;
      },
      (newTodo) => {
        // Добавляем новую задачу в localStorage
        const data = localStorage.getItem(owner) || '[]';
        const todos = JSON.parse(data);
        todos.push(newTodo);
        localStorage.setItem(owner, JSON.stringify(todos));
      },
    );

    const todoItemElement = createTodoItemElement(todoItem, handlers);

    todoList.append(todoItemElement);

    // обнуляем значение в поле, чтобы не пришлось его стирать вручную
    todoItemForm.input.value = '';
  });
}

export default createTodoApp;
