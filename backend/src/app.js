const express = require("express");
const authRoutes = require("./routes/auth");
const gincanasRoutes = require("./routes/gincanas");
const atividadesRoutes = require("./routes/atividades");

const app = express();

app.use(cors()); 
app.use(express.json());

// health
app.get("/", (req, res) => res.json({ status: "ok" }));

//Rotas
app.use("/auth", authRoutes);
app.use("/gincanas", gincanasRoutes);
app.use("/atividades", atividadesRoutes);

// error handler simple
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;