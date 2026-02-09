import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const PORT = 3000;
const DB_FILE = './todos.json';

if (!existsSync(DB_FILE)) {
  writeFileSync(DB_FILE, JSON.stringify([]), 'utf-8');
}

function readTodos() {
  return JSON.parse(readFileSync(DB_FILE, 'utf-8'));
}

function writeTodos(todos) {
  writeFileSync(DB_FILE, JSON.stringify(todos, null, 2), 'utf-8');
}

const server = createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight request
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const { method } = req;

  res.setHeader('Content-Type', 'application/json');

  if (url.pathname === '/api/todos' && method === 'GET') {
    const owner = url.searchParams.get('owner');
    const todos = readTodos();
    const filteredTodos = owner ? todos.filter((todo) => todo.owner === owner) : todos;
    res.end(JSON.stringify(filteredTodos));
  } else if (url.pathname === '/api/todos' && method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      const { name, owner, done } = JSON.parse(body);
      const todos = readTodos();
      const newTodo = {
        id: Date.now().toString(),
        name,
        owner,
        done: !!done,
      };
      todos.push(newTodo);
      writeTodos(todos);
      res.end(JSON.stringify(newTodo));
    });
  } else if (url.pathname.startsWith('/api/todos/') && method === 'GET') {
    const id = url.pathname.split('/').pop();
    const todos = readTodos();
    const todo = todos.find((todoItem) => todoItem.id === id);
    if (todo) {
      res.end(JSON.stringify(todo));
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Todo not found' }));
    }
  } else if (url.pathname.startsWith('/api/todos/') && method === 'PATCH') {
    const id = url.pathname.split('/').pop();
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      const updates = JSON.parse(body);
      const todos = readTodos();
      const todoItem = todos.find((item) => item.id === id);
      if (todoItem) {
        Object.assign(todoItem, updates);
        writeTodos(todos);
        res.end(JSON.stringify(todoItem));
      } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Todo not found' }));
      }
    });
  } else if (url.pathname.startsWith('/api/todos/') && method === 'DELETE') {
    const id = url.pathname.split('/').pop();
    const todos = readTodos();
    const index = todos.findIndex((item) => item.id === id);
    if (index !== -1) {
      todos.splice(index, 1);
      writeTodos(todos);
      res.end(JSON.stringify({ message: 'Todo deleted' }));
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Todo not found' }));
    }
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Сервер TODO запущен. Вы можете использовать его по адресу http://localhost:${PORT}`);
  console.log('Нажмите Ctrl+C, чтобы остановить сервер.');
  console.log('Доступные методы:');
  console.log('GET /api/todos - получить список дел, query параметр owner фильтрует по владельцу');
  // eslint-disable-next-line max-len
  console.log('POST /api/todos - создать дело, в теле запроса нужно передать объект { name: string, owner: string, done?: boolean }');
  console.log('GET /api/todos/{id} - получить дело по его ID');
  // eslint-disable-next-line max-len
  console.log('PATCH /api/todos/{id} - изменить дело с ID, в теле запроса нужно передать объект { name?: string, owner?: string, done?: boolean }');
  console.log('DELETE /api/todos/{id} - удалить дело по ID');
});
