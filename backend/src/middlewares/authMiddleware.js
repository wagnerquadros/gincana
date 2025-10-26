const jwt = require("jsonwebtoken");
const { isBlacklisted } = require("../services/tokenBlacklist");
const SECRET = process.env.JWT_SECRET || "troqueseusegredo_aqui";

// Autentica (exige Bearer token)
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token não enviado" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res
      .status(401)
      .json({ error: "Formato inválido (use Bearer <token>)" });
  }

  const token = parts[1];
  if (isBlacklisted(token))
    return res.status(401).json({ error: "Token invalidado (logout)" });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ error: "Token inválido ou expirado" });
    req.user = decoded; // { id, username, email, role }
    req.token = token;
    next();
  });
}

// Autoriza por role — aceita string única ou array no token
function authorizeRoles(...permitted) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Não autenticado" });

    const userRole = req.user.role;
    const rolesDoUsuario = Array.isArray(userRole) ? userRole : [userRole];

    const ok = rolesDoUsuario.some((r) => permitted.includes(r));
    if (!ok)
      return res
        .status(403)
        .json({ error: "Acesso negado: role insuficiente" });

    next();
  };
}

module.exports = { authMiddleware, authorizeRoles };
