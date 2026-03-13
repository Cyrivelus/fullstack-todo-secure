const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const PORT = 3000;

// --- CONFIGURATION MONGODB ---
const MONGO_URI =
  "mongodb+srv://cyrille:Cameroun2026@todocluster.rqyknuu.mongodb.net/todoDB?retryWrites=true&w=majority&appName=TodoCluster";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("🍃 Connecté à MongoDB Atlas"))
  .catch((err) => console.error("❌ Erreur de connexion MongoDB:", err));

// --- MODÈLE DE DONNÉES ---
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const Task = mongoose.model("Task", taskSchema);

// --- MIDDLEWARES ---
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const MY_SECRET_API_KEY = "gemini-123-flash";

// Middleware de sécurité
const checkApiKey = (req, res, next) => {
  const userKey = req.header("x-api-key");
  if (userKey && userKey === MY_SECRET_API_KEY) {
    next();
  } else {
    res
      .status(401)
      .json({ error: "Accès refusé : Clé API invalide ou absente." });
  }
};

// --- LES ROUTES ---

// 1. ROUTE D'ACCUEIL (Pour éviter le "Cannot GET /")
app.get("/", (req, res) => {
  res.send(
    "🚀 Serveur de Todo List en ligne ! (Utilisez /tasks pour les données)",
  );
});

// 2. GET : Lire toutes les tâches
app.get("/tasks", checkApiKey, async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des tâches" });
  }
});

// 3. POST : Créer une tâche
app.post("/tasks", checkApiKey, async (req, res) => {
  try {
    if (!req.body.title)
      return res.status(400).json({ error: "Le titre est requis" });

    const newTask = new Task({
      title: req.body.title,
      completed: false,
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la création" });
  }
});

// 4. PATCH : Modifier le statut (Cocher/Décocher)
app.patch("/tasks/:id", checkApiKey, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task) {
      task.completed = !task.completed;
      await task.save();
      res.json(task);
    } else {
      res.status(404).json({ error: "Tâche non trouvée" });
    }
  } catch (err) {
    res.status(400).json({ error: "ID invalide" });
  }
});

// 5. DELETE : Supprimer une tâche
app.delete("/tasks/:id", checkApiKey, async (req, res) => {
  try {
    const result = await Task.findByIdAndDelete(req.params.id);
    if (result) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Tâche introuvable pour suppression" });
    }
  } catch (err) {
    res.status(400).json({ error: "Erreur lors de la suppression" });
  }
});

app.listen(PORT, () =>
  console.log(` Backend prêt sur http://localhost:${PORT}`),
);
