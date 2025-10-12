const express = require('express');
const router = express.Router();
const { login, me, logout } = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, me);

module.exports = router;
