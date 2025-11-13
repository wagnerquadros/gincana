const express = require("express");
const path = require("path");
const cors = require("cors");

// ✅ OTIMIZAÇÃO: Compressão HTTP para reduzir tamanho das respostas
// Ganho: Redução de 70-90% no tamanho das respostas JSON
let compression;
try {
  compression = require("compression");
} catch (e) {
  console.warn("compression não instalado. Execute: npm install compression");
}

// Rotas
const authRoutes = require("./routes/auth");
const authPublic = require("./routes/authPublic");
const usuariosRoutes = require("./routes/usuarios");
const gincanasRoutes = require("./routes/gincanas");
const atividadesRoutes = require("./routes/atividades");
const equipesRoutes = require("./routes/equipes");
const alunosRoutes = require("./routes/alunos");
const notificacoesRoutes = require("./routes/notificacoes");

const app = express();
app.use(cors());

// ✅ OTIMIZAÇÃO: Compressão HTTP habilitada para todas as respostas
if (compression) {
  app.use(compression());
}

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
app.use("/revisoes", require("./routes/revisoes"));
app.use("/notificacoes", notificacoesRoutes);

// Servir arquivos estáticos de uploads (pasta fora de src/)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// error handler simples
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
