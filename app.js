const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(4000, () => {
      console.log("Server Running at http://localhost:4000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q } = request.query;
  if ((status !== undefined) & (priority !== undefined)) {
    const todoSearchQuery = `
    SELECT * FROM todo
    WHERE 
    status = '${status}' AND priority = '${priority}';`;
    const todoResponse = await db.all(todoSearchQuery);
    response.send(todoResponse);
  } else if (status !== undefined) {
    const todoSearchQuery = `
    SELECT * FROM todo
    WHERE 
    status = '${status}';`;
    const todoResponse = await db.all(todoSearchQuery);
    response.send(todoResponse);
  } else if (priority !== undefined) {
    const todoSearchQuery = `
    SELECT * FROM todo
    WHERE 
    priority = '${priority}';`;
    const todoResponse = await db.all(todoSearchQuery);
    response.send(todoResponse);
  } else if (search_q !== undefined) {
    const todoSearchQuery = `
    SELECT * FROM todo
    WHERE 
    todo LIKE '%${search_q}%';`;
    const todoResponse = await db.all(todoSearchQuery);
    response.send(todoResponse);
  } else {
    const todoSearchQuery = `
    SELECT * FROM todo`;
    const todoResponse = await db.all(todoSearchQuery);
    response.send(todoResponse);
  }
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT * FROM todo
    WHERE
    id = ${todoId};`;
  const todoResponse = await db.get(getTodoQuery);
  response.send(todoResponse);
});

//API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const createTodoQuery = `
    INSERT INTO todo (id, todo, priority, status)
    VALUES 
    (${id},"${todo}", "${priority}", "${status}");`;
  const newTodo = await db.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

//API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  if (status !== undefined) {
    const updateTodoQuery = `
        UPDATE todo
        SET 
        status = '${status}'
        WHERE 
        id = ${todoId};`;
    const updateTodo = await db.run(updateTodoQuery);
    response.send("Status Updated");
  } else if (priority !== undefined) {
    const updateTodoQuery = `
        UPDATE todo
        SET 
        priority = '${priority}'
        WHERE 
        id = ${todoId};`;
    const updateTodo = await db.run(updateTodoQuery);
    response.send("Priority Updated");
  } else if (todo !== undefined) {
    const updateTodoQuery = `
        UPDATE todo
        SET 
        todo = '${todo}'
        WHERE 
        id = ${todoId};`;
    const updateTodo = await db.run(updateTodoQuery);
    response.send("Todo Updated");
  }
});

//API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE FROM todo
    WHERE id = ${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
