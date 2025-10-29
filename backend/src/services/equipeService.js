// src/services/equipeService.js
const path = require("path");
const { db } = require(path.resolve(__dirname, "../../firebase.js"));
const Equipe = require("../models/Equipe");

const COLL = "equipes";

// Util
const isStr = (v) => typeof v === "string" && v.trim().length > 0;

async function criarEquipe(equipeData) {
  if (!db) throw new Error("Firebase não inicializado");

  const { nome, gincanaId, ativo = true } = equipeData || {};
  if (!isStr(nome)) throw new Error("Campo 'nome' é obrigatório");
  if (!isStr(gincanaId)) throw new Error("Campo 'gincanaId' é obrigatório");

  const equipeRef = db.collection(COLL).doc();
  const equipe = new Equipe(
    equipeRef.id,
    gincanaId.trim(),
    nome.trim(),
    !!ativo,
    [] // nasce zerada: pontuacoesIds = []
  );

  const payload = {
    ...equipe.toObject(),
    atualizadoEm: new Date(),
  };

  await equipeRef.set(payload);

  return payload; // objeto plano serializável
}

async function listarEquipes() {
  if (!db) throw new Error("Firebase não inicializado");
  const qs = await db.collection(COLL).get();
  return qs.docs.map((d) => {
    const e = Equipe.fromDoc(d);
    return e?.toObject ? e.toObject() : e;
  });
}

async function obterEquipePorId(id) {
  if (!db) throw new Error("Firebase não inicializado");
  if (!isStr(id)) throw new Error("ID inválido");

  const doc = await db.collection(COLL).doc(id).get();
  if (!doc.exists) throw new Error("Equipe não encontrada");

  const e = Equipe.fromDoc(doc);
  return e?.toObject ? e.toObject() : e;
}

async function atualizarEquipe(id, data) {
  if (!db) throw new Error("Firebase não inicializado");
  if (!isStr(id)) throw new Error("ID inválido");

  const ref = db.collection(COLL).doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Equipe não encontrada");

  const updates = { atualizadoEm: new Date() };

  if (isStr(data?.nome)) updates.nome = data.nome.trim();
  if (isStr(data?.gincanaId)) updates.gincanaId = data.gincanaId.trim();
  if (typeof data?.ativo === "boolean") updates.ativo = data.ativo;

  // opcional: permitir atualizar apenas IDs de pontuações
  if (Array.isArray(data?.pontuacoesIds)) {
    updates.pontuacoesIds = data.pontuacoesIds.filter(isStr);
  }

  await ref.set(updates, { merge: true });

  const updated = await ref.get();
  const e = Equipe.fromDoc(updated);
  return e?.toObject ? e.toObject() : e;
}

async function deletarEquipe(id) {
  if (!db) throw new Error("Firebase não inicializado");
  if (!isStr(id)) throw new Error("ID inválido");

  const ref = db.collection(COLL).doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Equipe não encontrada");

  await ref.delete();
  return { ok: true, message: "Equipe deletada com sucesso", id };
}


async function listarEquipesPorGincana({ gincanaId, ativo } = {}) {
  if (!db) throw new Error("Firebase não inicializado");
  if (!isStr(gincanaId)) throw new Error("gincanaId é obrigatório");

  // 🔹 Somente 1 where no Firestore (evita índice composto)
  const qs = await db
    .collection(COLL)
    .where("gincanaId", "==", gincanaId.trim())
    .get();

  // Converte pra objeto plano
  let equipes = qs.docs.map((d) => {
    const e = Equipe.fromDoc(d);
    return e?.toObject ? e.toObject() : e;
  });

  // 🔹 Filtro opcional em memória (não exige índice)
  if (typeof ativo === "boolean") {
    equipes = equipes.filter((e) => !!e?.ativo === !!ativo);
  }

  // (Opcional) ordenar por nome, se quiser
  equipes.sort((a, b) => (a?.nome || "").localeCompare(b?.nome || "", "pt-BR"));

  return equipes;
}

module.exports = {
  criarEquipe,
  listarEquipes,
  obterEquipePorId,
  atualizarEquipe,
  deletarEquipe,
  listarEquipesPorGincana,
};
