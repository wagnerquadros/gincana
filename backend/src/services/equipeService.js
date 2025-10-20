const { db } = require("./firebaseService.js");
const Equipe = require("../models/Equipe");

if (!db) {
  console.warn("⚠️ Firebase DB não inicializado. As operações em 'equipes' não funcionarão.");
}

const criarEquipe = async (equipeData) => {
  if (!db) throw new Error("Firebase não inicializado");

  if (!equipeData.nome) throw new Error("Campo 'nome' é obrigatório");
  if (!equipeData.gincana) throw new Error("Campo 'gincana' é obrigatório");
  if (typeof equipeData.ativo !== "boolean") equipeData.ativo = true;

  const equipe = new Equipe(
    null,
    equipeData.gincana,
    equipeData.nome,
    equipeData.ativo,
    []
  );

  const equipeRef = db.collection("equipes").doc();
  equipe.id = equipeRef.id;

  const batch = db.batch();

  const createdPontIds = [];
  if (Array.isArray(equipeData.pontuacoes)) {
    for (const p of equipeData.pontuacoes) {
      if (!p) continue;

      if (typeof p === "string") {
        createdPontIds.push(p);
        continue;
      }

      const pontRef = db.collection("pontuacoes").doc();
      const pontId = pontRef.id;
      createdPontIds.push(pontId);

      const pontObj = {
        id: pontId,
        equipeId: equipe.id,
        atividadeId: p.atividade || p.atividadeId || null,
        pontosObtidos: Number(p.pontosObtidos) || 0,
        bonus: Number(p.bonus) || 0,
        penalidade: Number(p.penalidade) || 0,
        criadoEm: p.criadoEm || new Date()
      };
      batch.set(pontRef, pontObj);
    }
  }

  batch.set(equipeRef, { ...equipe.toObject(), pontuacoes: createdPontIds });

  await batch.commit();

  equipe.pontuacoes = createdPontIds;
  return equipe;
};

const listarEquipes = async () => {
  if (!db) throw new Error("Firebase não inicializado");

  const snapshot = await db.collection("equipes").get();
  return snapshot.docs.map(doc => Equipe.fromDoc(doc));
};

const obterEquipePorId = async (id) => {
  if (!db) throw new Error("Firebase não inicializado");

  const doc = await db.collection("equipes").doc(id).get();
  if (!doc.exists) throw new Error("Equipe não encontrada");

  return Equipe.fromDoc(doc);
};

const atualizarEquipe = async (id, equipeData) => {
  if (!db) throw new Error("Firebase não inicializado");

  const equipeRef = db.collection("equipes").doc(id);
  const doc = await equipeRef.get();
  if (!doc.exists) throw new Error("Equipe não encontrada");

  const updates = {};
  if (equipeData.nome) updates.nome = equipeData.nome;
  if (equipeData.gincana) updates.gincana = equipeData.gincana;
  if (typeof equipeData.ativo === "boolean") updates.ativo = equipeData.ativo;

  await equipeRef.update(updates);

  const updatedDoc = await equipeRef.get();
  return Equipe.fromDoc(updatedDoc);
};

const deletarEquipe = async (id) => {
  if (!db) throw new Error("Firebase não inicializado");

  const equipeRef = db.collection("equipes").doc(id);
  const doc = await equipeRef.get();
  if (!doc.exists) throw new Error("Equipe não encontrada");

  await equipeRef.delete();
  return { message: "Equipe deletada com sucesso", id };
};

module.exports = {
  criarEquipe,
  listarEquipes,
  obterEquipePorId,
  atualizarEquipe,
  deletarEquipe
};
