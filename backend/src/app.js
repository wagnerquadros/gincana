const express = require('express');
const cors = require('cors'); 
const authRoutes = require('./routes/auth');
const equipeRoutes = require("./routes/equipeRoutes");

const app = express();

app.use(cors()); 
app.use(express.json());

// health
app.get('/', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use("/equipes", equipeRoutes);

// error handler simple
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;