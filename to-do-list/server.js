const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const MY_SECRET_API_KEY = "gemini-123-flash";

const checkApiKey = (req, res, next) => {
  const userKey = req.header("x-api-key");
  if (userKey && userKey === MY_SECRET_API_KEY) {
    next();
  } else {
    res.status(401).json({ error: "Clé API invalide." });
  }
};

let tasks = [
  { id: 1, title: "Sécuriser mon API", completed: true },
  { id: 2, title: "Lier React à Node", completed: false },
];

// GET : Lire
app.get("/tasks", checkApiKey, (req, res) => res.json(tasks));

// POST : Créer
app.post("/tasks", checkApiKey, (req, res) => {
  if (!req.body.title) return res.status(400).json({ error: "Titre requis" });
  const newTask = { id: Date.now(), title: req.body.title, completed: false };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PATCH : Modifier le statut (Cocher/Décocher)
app.patch("/tasks/:id", checkApiKey, (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    res.json(task);
  } else {
    res.status(404).send();
  }
});

// DELETE : Supprimer
app.delete("/tasks/:id", checkApiKey, (req, res) => {
  const id = parseInt(req.params.id);
  tasks = tasks.filter((t) => t.id !== id);
  res.status(204).send();
});

app.listen(PORT, () => console.log(`🚀 Backend sur http://localhost:${PORT}`));
