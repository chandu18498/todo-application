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
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
//API 1
//Scenario 1, 2, 3, 4
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q } = request.query;
  let getTodoQuery = null;
  let queryResponse = null;
  switch (true) {
    case status !== undefined:
      getTodoQuery = `
        SELECT * FROM todo
        WHERE status = '${status}';`;
      queryResponse = await db.all(getTodoQuery);
      response.send(queryResponse);
      break;
    case priority !== undefined:
      getTodoQuery = `
        SELECT * FROM todo
        WHERE priority = '${priority}';`;
      queryResponse = await db.all(getTodoQuery);
      response.send(queryResponse);
      break;
    case search_q !== undefined:
      getTodoQuery = `
        SELECT * FROM todo
        WHERE todo LIKE '%${search_q}%'`;
      queryResponse = await db.all(getTodoQuery);
      response.send(queryResponse);
      break;
    default:
      getTodoQuery = `SELECT * FROM todo`;
      queryResponse = await db.all(getTodoQuery);
      response.send(queryResponse);
  }
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT * FROM todo
    WHERE id = ${todoId};`;
  const queryResponse = await db.get(getTodoQuery);
  response.send(queryResponse);
});

//API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  console.log(id);
  console.log(todo);
  console.log(priority);
  console.log(status);
  const postTodoQuery = `
    INSERT INTO todo (id, todo, priority, status)
    VALUES 
    (${id}, '${todo}', '${priority}', '${status}');`;
  const postQuery = await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

//API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const elements = request.body;
  const { status, priority, todo } = elements;
  let putQuery = null;
  switch (true) {
    case status !== undefined:
      putQuery = `
          UPDATE todo
          SET 
          status = '${status}'
          WHERE 
          id = ${todoId};`;
      await db.run(putQuery);
      response.send("Status Updated");
      break;
    case priority !== undefined:
      putQuery = `
          UPDATE todo
          SET 
          status = '${priority}'
          WHERE 
          id = ${todoId};`;
      await db.run(putQuery);
      response.send("Priority Updated");
      break;
    case todo !== undefined:
      putQuery = `
          UPDATE todo
          SET 
          status = '${priority}'
          WHERE 
          id = ${todoId};`;
      await db.run(todo);
      response.send("Todo Updated");
    default:
      response.send("");
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
