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

// Получить список дел
export async function getTodoItemList(owner) {
  return fetchWithFallback(
    `${API_URL}?owner=${owner}`, // URL для получения задач конкретного владельца
    { method: 'GET' }, // Метод GET для получения задач
    () => { // Фоллбек на случай ошибки
      const data = localStorage.getItem(owner) || '[]';
      return JSON.parse(data);
    },
    (data) => {
      // Сохраняем актуальный список в localStorage
      localStorage.setItem(owner, JSON.stringify(data));
    },
  );
}

// Добавить новое дело
export async function createTodoItem({ name, owner }) {
  return fetchWithFallback(
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
}

// Обновить дело
export async function toggleTodoItem({ id, owner, done }) {
  return fetchWithFallback(
    `${API_URL}/${id}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done }),
    },
    () => { // Первый блок (fallback) — используется, если сервер недоступен
      const data = localStorage.getItem(owner) || '[]';
      const todos = JSON.parse(data);
      const todo = todos.find((item) => item.id === id);
      if (todo) todo.done = done;
      localStorage.setItem(owner, JSON.stringify(todos));
      return todo;
    },
    (updatedTodo) => { // Второй блок (onSuccess) — используется, если сервер доступен
      // Обновляем дело в localStorage
      const data = localStorage.getItem(owner) || '[]';
      const todos = JSON.parse(data);
      const todo = todos.find((item) => item.id === id);
      if (todo) todo.done = updatedTodo.done;
      localStorage.setItem(owner, JSON.stringify(todos));
    },
  );
}

// Удалить дело
export async function deleteTodoItem({ id, owner }) {
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
}
