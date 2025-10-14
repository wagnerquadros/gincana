const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/dados', (req, res) => {
  res.json({ message: 'Acesso autorizado!', userId: req.userId });
});

module.exports = router;
