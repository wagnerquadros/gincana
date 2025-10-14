
const admin = require("../adminSetup");

async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer (.*)$/);
  if (!match) return res.status(401).json({ error: "No token provided" });
  const idToken = match[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    // decoded contém uid, email, e custom claims
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
}

function requireRole(role) {
  return function (req, res, next) {
    const claims = req.user || {};
    // Se você usou custom claims: claims.role
    if (claims.role === role || (claims.roles && claims.roles.includes(role))) {
      return next();
    }
    // Alternativa: ler do Firestore para perfis dinâmicos (implementar caso necessário)
    return res.status(403).json({ error: "Insufficient permissions" });
  };
}

module.exports = { verifyFirebaseToken, requireRole };
