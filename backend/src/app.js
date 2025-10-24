const express = require("express");
const authRoutes = require("./routes/auth");
const gincanasRoutes = require("./routes/gincanas");
const atividadesRoutes = require("./routes/atividades");
const equipeRoutes = require("./routes/equipeRoutes");

const cors = require("cors");

const app = express();

app.use(cors()); 
app.use(express.json());

// health
app.get("/", (req, res) => res.json({ status: "ok" }));

//Rotas
app.use("/auth", authRoutes);
app.use("/gincanas", gincanasRoutes);
app.use("/atividades", atividadesRoutes);
app.use("/equipes", equipeRoutes);

// error handler simple
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;