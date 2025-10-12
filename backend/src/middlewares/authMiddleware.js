const jwt = require('jsonwebtoken');
const { isBlacklisted } = require('../services/tokenBlacklist');
const SECRET = process.env.JWT_SECRET || 'troqueseusegredo_aqui';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não enviado' });

  const parts = authHeader.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Formato inválido' });

  const token = parts[1];
  if (isBlacklisted(token)) return res.status(401).json({ error: 'Token invalidado (logout)' });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = decoded;
    req.token = token;
    next();
  });
}

module.exports = { authMiddleware };
