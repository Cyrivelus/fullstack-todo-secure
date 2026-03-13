import { useState, useEffect } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // L'URL de base pour tes tâches
  const API_URL = "http://localhost:3000/tasks";
  const API_KEY = "gemini-123-flash";

  // 1. Charger les tâches (Read)
  const fetchTasks = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { "x-api-key": API_KEY },
      });
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Erreur de chargement:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 2. Ajouter une tâche (Create)
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ title: newTaskTitle }),
    });

    setNewTaskTitle("");
    fetchTasks();
  };

  // 3. Modifier le statut (Update) - Utilise _id
  const toggleTask = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "x-api-key": API_KEY },
    });
    fetchTasks();
  };

  // 4. Supprimer la tâche (Delete) - Utilise _id
  const deleteTask = async (id) => {
    // On envoie bien l'ID MongoDB (ex: 65ef...) dans l'URL
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { "x-api-key": API_KEY },
    });
    fetchTasks();
  };

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "500px",
        margin: "auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Ma Todo List Fullstack ⚡</h1>

      <form
        onSubmit={addTask}
        style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
      >
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Ajouter une tâche..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ddd",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Ajouter
        </button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((t) => (
          <li
            key={t._id} // ID unique de MongoDB
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px",
              borderBottom: "1px solid #eee",
              background: t.completed ? "#f9f9f9" : "white",
            }}
          >
            <span
              onClick={() => toggleTask(t._id)} // On passe _id au clic
              style={{
                cursor: "pointer",
                textDecoration: t.completed ? "line-through" : "none",
                color: t.completed ? "#aaa" : "#333",
                flex: 1,
              }}
            >
              {t.completed ? "✅ " : "⭕ "} {t.title}
            </span>
            <button
              onClick={() => deleteTask(t._id)} // On passe _id ici aussi !
              style={{
                padding: "5px 10px",
                background: "#ff4d4d",
                color: "white",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && (
        <p style={{ textAlign: "center", color: "#999" }}>
          Aucune tâche pour le moment !
        </p>
      )}
    </div>
  );
}

export default App;
