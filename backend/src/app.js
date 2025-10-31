const express = require("express");
const path = require("path");
const cors = require("cors");

// Rotas
const authRoutes = require("./routes/auth");
const authPublic = require("./routes/authPublic");
const usuariosRoutes = require("./routes/usuarios");
const gincanasRoutes = require("./routes/gincanas");
const atividadesRoutes = require("./routes/atividades");
const equipesRoutes = require("./routes/equipes");
const alunosRoutes = require("./routes/alunos");

const app = express();
app.use(cors());
app.use(express.json());

// health
app.get("/", (req, res) => res.json({ status: "ok" }));

// Rotas públicas
app.use("/auth", authPublic); // /auth/signup
app.use("/auth", authRoutes); // /auth/login, /auth/logout, /auth/me

// Rotas protegidas
app.use("/usuarios", usuariosRoutes);
app.use("/gincanas", gincanasRoutes);
app.use("/atividades", atividadesRoutes);
app.use("/equipes", equipesRoutes);
app.use("/alunos", alunosRoutes);

// Servir arquivos estáticos de uploads (pasta fora de src/)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// error handler simples
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
