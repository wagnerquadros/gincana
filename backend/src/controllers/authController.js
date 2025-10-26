// controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { getByEmail } = require("../services/usuariosService"); // <-- use o service certo
const { addToBlacklist } = require("../services/tokenBlacklist");

const SECRET = process.env.JWT_SECRET || "troqueseusegredo_aqui";

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "E-mail e senha são obrigatórios" });

    const emailNorm = String(email).toLowerCase().trim();
    console.log("[login] email:", email, "=>", emailNorm);

    const user = await getByEmail(emailNorm);
    console.log("[login] achou?", !!user, user?.id);

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    if (user.ativo === false)
      return res.status(403).json({ error: "Usuário inativo" });

    const ok = await bcrypt.compare(password, user.senha);
    if (!ok) return res.status(401).json({ error: "Senha inválida" });

    const payload = {
      id: user.id,
      email: user.email,
      nome: user.nome || null,
      role: user.role || "ALUNO",
    };
    const token = jwt.sign(payload, SECRET, { expiresIn: "1h" });
    return res.json({ token, user: payload });
  } catch (e) {
    console.error("[login] erro:", e);
    return res.status(500).json({ error: "Erro ao realizar login" });
  }
}

async function me(req, res) {
  return res.json({ user: req.user });
}
async function logout(req, res) {
  addToBlacklist(req.token);
  return res.json({ message: "Logout realizado" });
}

module.exports = { login, me, logout };
