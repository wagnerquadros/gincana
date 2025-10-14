const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getUserByUsername, getUserByEmail } = require('../services/firebaseService');
const { addToBlacklist } = require('../services/tokenBlacklist');

const SECRET = process.env.JWT_SECRET || 'troqueseusegredo_aqui';

// Accepts either { username, password } OR { email, password }
async function login(req, res) {
  const { username, email, password } = req.body;
  if ((!username && !email) || !password) {
    return res.status(400).json({ error: 'username OR email, and password are required' });
  }

  let user = null;
  if (email) user = await getUserByEmail(email);
  if (!user && username) user = await getUserByUsername(username);

  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  // If passwords in DB are plain (not recommended) compare directly, else use bcrypt.compare
  const isHashed = typeof user.password === 'string' && user.password.startsWith('$2b$');
  if (isHashed) {
    match = await bcrypt.compare(password, user.password);
  } else {
    match = password === user.password;
  }


  if (!match) return res.status(401).json({ error: 'Senha inválida' });

  const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, SECRET, { expiresIn: '1h' });
  res.json({ token });
}

async function me(req, res) {
  // req.user is filled by authMiddleware
  res.json({ user: req.user });
}

async function logout(req, res) {
  const token = req.token;
  addToBlacklist(token);
  res.json({ message: 'Logout realizado' });
}

module.exports = { login, me, logout };
