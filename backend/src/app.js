const express = require('express');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());

// health
app.get('/', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);

// error handler simple
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
