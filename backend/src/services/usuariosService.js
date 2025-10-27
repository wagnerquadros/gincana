// src/services/usuariosService.js
const { db } = require("../../firebase");
const bcrypt = require("bcrypt");
const RoleEnum = require("../models/enums/RoleEnum");

const COLL = "usuarios";
const SALT = 12;

// Remove 'senha' antes de devolver ao controller
const sanitize = (u) => {
  if (!u) return null;
  const { senha, ...safe } = u;
  return safe;
};

async function getById(id) {
  const snap = await db.collection(COLL).doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
}

async function getByEmail(emailRaw) {
  const email = String(emailRaw).toLowerCase().trim();
  console.log("[getByEmail] buscando:", email);
  const qs = await db
    .collection(COLL)
    .where("email", "==", email)
    .limit(1)
    .get();
  if (qs.empty) return null;
  const doc = qs.docs[0];
  console.log("[getByEmail] buscando:", email);
  return { id: doc.id, ...doc.data() };
}

async function listAll({ limit = 50 } = {}) {
  const qs = await db
    .collection(COLL)
    .orderBy("criadoEm", "desc")
    .limit(limit)
    .get();
  return qs.docs.map((d) => sanitize({ id: d.id, ...d.data() }));
}

function assertRole(role) {
  const roles = Object.values(RoleEnum);
  if (!roles.includes(role)) {
    throw new Error(`Role inválida. Use uma de: ${roles.join(", ")}`);
  }
}

async function createUsuario({
  nome,
  foto = null,
  email,
  senha,
  role = RoleEnum.ALUNO,
  ativo = true,
}) {
  if (!nome || !email || !senha)
    throw new Error("Campos obrigatórios: nome, email, senha");

  const emailNorm = String(email).toLowerCase().trim();
  assertRole(role);

  // checa duplicidade
  const exists = await getByEmail(emailNorm);
  if (exists) throw new Error("E-mail já cadastrado");

  const ref = db.collection(COLL).doc();
  const hash = await bcrypt.hash(senha, SALT);

  const payload = {
    id: ref.id,
    nome: String(nome).trim(),
    foto: typeof foto === "string" ? foto : null,
    email: emailNorm,
    senha: hash,
    role,
    ativo: !!ativo,
    criadoEm: new Date(),
  };

  await ref.set(payload);
  return sanitize(payload);
}

async function updateUsuario(id, { nome, foto, role, ativo }) {
  const current = await getById(id);
  if (!current) throw new Error("Usuário não encontrado");

  const update = {
    ...(typeof nome !== "undefined" ? { nome: String(nome).trim() } : {}),
    ...(typeof foto !== "undefined" ? { foto } : {}),
    ...(typeof role !== "undefined" ? { role } : {}),
    ...(typeof ativo !== "undefined" ? { ativo: !!ativo } : {}),
    updatedAt: new Date(),
  };

  await db.collection(COLL).doc(id).set(update, { merge: true });
  return sanitize({ ...current, ...update });
}

async function updateSenha(id, senhaNova) {
  if (!senhaNova || String(senhaNova).length < 6) {
    throw new Error("A senha deve ter pelo menos 6 caracteres");
  }
  const hash = await bcrypt.hash(String(senhaNova), SALT);
  await db
    .collection(COLL)
    .doc(id)
    .set({ senha: hash, updatedAt: new Date() }, { merge: true });
  return true;
}

async function softDelete(id) {
  const user = await getById(id);
  if (!user) throw new Error("Usuário não encontrado");
  await db
    .collection(COLL)
    .doc(id)
    .set({ ativo: false, updatedAt: new Date() }, { merge: true });
  return true;
}

async function listAlunos({ limit = 50, page = 1, ativo } = {}) {
  let q = db.collection(COLL).where("role", "==", "ALUNO");
  if (typeof ativo === "boolean") q = q.where("ativo", "==", ativo);

  // paginação simples (firestore real precisa cursor; aqui fazemos limit básico)
  const snap = await q.limit(limit).get();
  return snap.docs.map((d) => sanitize({ id: d.id, ...d.data() }));
}

async function getAlunoById(id) {
  const doc = await db.collection(COLL).doc(id).get();
  if (!doc.exists) return null;
  const u = { id: doc.id, ...doc.data() };
  if (u.role !== "ALUNO") return null;
  return sanitize(u);
}

module.exports = {
  getById,
  getByEmail,
  listAll,
  createUsuario,
  updateUsuario,
  updateSenha,
  softDelete,
  listAlunos,
  getAlunoById,
};
