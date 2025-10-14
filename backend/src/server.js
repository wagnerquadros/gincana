
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const protectedRoutes = require("./routes/protected");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// rotas
app.get("/api/ping", (req, res) => res.json({ ok: true }));
app.use("/api/protected", protectedRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
