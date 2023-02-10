const { randomUUID } = require('crypto')
const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

const users = []

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find((user) => user.username === username)

  if (!user) {
    return response.status(404).json({ error: 'Username not found!' })
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const usernameAlreadyExists = users.find((user) => username === user.username)

  if (usernameAlreadyExists) {
    return response.status(400).json({ error: 'Username already exists!' })
  }

  const user = {
    id: randomUUID(),
    name,
    username,
    todos: [],
  }

  users.push(user)

  return response.status(201).json(user)
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user

  return response.json(todos)
})

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body

  const { user } = request

  const todo = {
    id: randomUUID(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
})

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { id } = request.params

  const { user } = request

  const todoIndex = user.todos.findIndex((todo) => todo.id === id)

  if (todoIndex > -1) {
    user.todos[todoIndex].title = title
    user.todos[todoIndex].deadline = new Date(deadline)
    return response.status(201).json(user.todos[todoIndex])
  }

  return response.status(404).json({ error: 'To-Do not found' })
})

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params

  const { user } = request

  const todoIndex = user.todos.findIndex((todo) => todo.id === id)

  if (todoIndex > -1) {
    user.todos[todoIndex].done = true
    return response.status(201).json(user.todos[todoIndex])
  }

  return response.status(404).json({ error: 'To-Do not found' })
})

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params

  const { user } = request

  const todoIndex = user.todos.findIndex((todo) => todo.id === id)

  if (todoIndex > -1) {
    user.todos.splice(todoIndex, 1)
    return response.status(204).send()
  }

  return response.status(404).json({ error: 'To-Do not found' })
})

module.exports = app
