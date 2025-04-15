(function () {
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

  function createItemId() {
    const listName = [...document.querySelectorAll('li')];
    const numberId = 1 + Math.max(0, ...listName.map((el) => el.id));
    // let timestamp = Date.now();
    // let randomNumber = Math.floor(Math.random() * 10);

    return numberId;
    // return timestamp + randomNumber;
  }

  function createTodoItem(name, done) {
    const item = document.createElement('li');
    item.id = createItemId();

    const buttonGroup = document.createElement('div');
    const doneButton = document.createElement('button');
    const deleteButton = document.createElement('button');

    item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    item.textContent = name;

    if (done) {
      item.classList.add('list-group-item-success');
    }

    buttonGroup.classList.add('btn-group', 'btn-group-sm');
    doneButton.classList.add('btn', 'btn-success');
    doneButton.textContent = 'Готово';
    deleteButton.classList.add('btn', 'btn-danger');
    deleteButton.textContent = 'Удалить';

    buttonGroup.append(doneButton);
    buttonGroup.append(deleteButton);
    item.append(buttonGroup);

    return {
      item,
      doneButton,
      deleteButton,
      name,
    };
  }

  function getStorage(key) {
    const itemsJSON = localStorage.getItem(key);
    return itemsJSON ? JSON.parse(itemsJSON) : [];
  }

  function setStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function createTodoApp(container, title, key) {
    const todoAppTitle = createAppTitle(title);
    const todoItemForm = createTodoItemForm();
    const todoList = createTodoList();

    container.append(todoAppTitle);
    container.append(todoItemForm.form);
    container.append(todoList);

    const listName = getStorage(key);

    if (listName) {
      listName.map((element) => {
        const todoItem = createTodoItem(element.name, element.done);

        todoItem.doneButton.addEventListener('click', () => {
          todoItem.item.classList.add('list-group-item-success');

          const index = listName.findIndex((el) => el.name === todoItem.name);

          if (listName[index].done) {
            listName[index].done = false;
          } else {
            listName[index].done = true;
          }
          setStorage(key, listName);
        });

        todoItem.deleteButton.addEventListener('click', () => {
          if (confirm('Вы уверенны?')) {
            const index = listName.findIndex((el) => el.name === todoItem.name);

            listName.splice(index, 1);
            for (let i = 0; i < listName.length; i++) {
              listName[i].id = i + 1;
            }
            setStorage(key, listName);
            todoItem.item.remove();
          }
        });

        return todoList.append(todoItem.item);
      });
    }

    todoItemForm.form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!todoItemForm.input.value) {
        return;
      }

      const todoItem = createTodoItem(todoItemForm.input.value);

      todoItem.doneButton.addEventListener('click', () => {
        todoItem.item.classList.add('list-group-item-success');
        const index = listName.findIndex((el) => el.name === todoItem.name);

        if (listName[index].done) {
          listName[index].done = false;
        } else {
          listName[index].done = true;
        }
        setStorage(key, listName);
      });

      todoItem.deleteButton.addEventListener('click', () => {
        if (confirm('Вы уверенны?')) {
          const index = listName.findIndex((el) => el.name === todoItem.name);

          listName.splice(index, 1);
          for (let i = 0; i < listName.length; i++) {
            listName[i].id = i + 1;
          }
          setStorage(key, listName);
          todoItem.item.remove();
        }
      });

      listName.push({ id: createItemId(), name: todoItemForm.input.value, done: false });
      setStorage(key, listName);

      todoList.append(todoItem.item);

      todoItemForm.input.value = '';

      todoItemForm.button.classList.add('disabled');
    });

    todoItemForm.input.addEventListener('input', () => {
      todoItemForm.button.classList.add('disabled');

      if (todoItemForm.input.value) {
        todoItemForm.button.classList.remove('disabled');
      }
    });
  }

  window.createTodoApp = createTodoApp;
}());
