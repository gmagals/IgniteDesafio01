const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if(!user) return response.status(404).json({ error: 'User does not exists' });
  request.user = user;

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const checkIfUserExists = users.some((user) => user.username === username);

  if(checkIfUserExists) return response.status(400).json({ error: 'Username already exists.'});

  const createdUser = {
    id: uuidv4(), name, username, todos: []
  };

  users.push(createdUser);
  console.log(users)
  return response.status(201).json(createdUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;

  return response.status(201).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body;
  const createdTodo = { id: uuidv4(), title, done: false, deadline, created_at: new Date()}

  user.todos.push(createdTodo);
  console.log("POST TODOS", user.todos)
  return response.status(201).json(createdTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);
  if(!todo) return response.status(404).json({ error: "To Do not found!" });
  
  todo.title = title ? title : todo.title;
  todo.deadline = deadline ? new Date(deadline) : todo.deadline;

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);
  if(!todo) return response.status(404).json({ error: "To Do not found!" });

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);
  if(!todo) return response.status(404).json({ error: "To Do not found!" });

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;