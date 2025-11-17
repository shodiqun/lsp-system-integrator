const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

const users = new Map([
  ["user-1", { id: "user-1", email: "ayu@example.com", name: "Ayu" }],
  ["user-2", { id: "user-2", email: "indra@example.com", name: "Indra" }],
  ["user-3", { id: "user-3", email: "maria@example.com", name: "Maria" }]
]);

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "user", users: users.size });
});

app.get("/users", (_req, res) => {
  res.json(Array.from(users.values()));
});

app.get("/users/:id", (req, res) => {
  const user = users.get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User tidak ditemukan" });
  }
  res.json(user);
});

app.post("/users", (req, res) => {
  const { id, email, name } = req.body;
  if (!id || !email || !name) {
    return res.status(400).json({ error: "id, email, name wajib diisi" });
  }
  if (users.has(id)) {
    return res.status(409).json({ error: "User sudah ada" });
  }
  const user = { id, email, name };
  users.set(id, user);
  res.status(201).json(user);
});

app.listen(PORT, () => {
  console.log(`User service listening on port ${PORT}`);
});
