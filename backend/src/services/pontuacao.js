const { db, admin } = require("../../firebase");
const Pontuacao = require("../models/Pontuacao");

// helper: número seguro
const num = (v, def = 0) => (typeof v === "number" ? v : def);

/**
 * Encerra atividade e gera pontuações por classificação.
 * Agora: cria documentos em "pontuacoes" e guarda apenas os IDs em `equipes.pontuacoesIds`.
 *
 * @param {string} atividadeId
 * @param {object} params
 *  - classificacao: array de equipeIds em ordem [1o, 2o, 3o, ...]
 *  - bonus: objeto opcional { [equipeId]: number }
 *  - penalidade: objeto opcional { [equipeId]: number }
 *  - fimISO: string "yyyy-MM-dd" opcional (se não vier, usa agora)
 */
async function encerrarAtividadeEGerarPontuacoes(
  atividadeId,
  { classificacao = [], bonus = {}, penalidade = {}, fimISO = null }
) {
  // 1) Ler atividade
  const atRef = db.collection("atividades").doc(atividadeId);
  const atSnap = await atRef.get();
  if (!atSnap.exists) throw new Error("Atividade não encontrada");

  const at = atSnap.data();

  // pontos base por posição (1º, 2º, 3º); demais colocados = 0
  const basePos = [
    num(at.pontosPrimeiro, 0),
    num(at.pontosSegundo, 0),
    num(at.pontosTerceiro, 0),
  ];

  // 2) Preparar batch
  const batch = db.batch();
  const agora = new Date();
  const fim = fimISO ? new Date(fimISO) : new Date();

  // 3) Para cada equipe na classificação:
  for (let i = 0; i < classificacao.length; i++) {
    const equipeId = classificacao[i];
    const pontosObtidos = basePos[i] || 0;
    const b = num(bonus[equipeId], 0);
    const p = num(penalidade[equipeId], 0);

    // (a) cria doc real em "pontuacoes"
    const pontRef = db.collection("pontuacoes").doc();
    const pontoObj = new Pontuacao(
      pontRef.id,
      equipeId,
      atividadeId,
      pontosObtidos,
      b,
      p
    ).toObject();

    batch.set(pontRef, {
      ...pontoObj,
      criadoEm: agora, // garante timestamp consistente
    });

    // (b) atualiza equipe: guarda apenas o ID recém criado
    const equipeRef = db.collection("equipes").doc(equipeId);
    batch.update(equipeRef, {
      pontuacoesIds: admin.firestore.FieldValue.arrayUnion(pontRef.id),
      atualizadoEm: agora,
    });
  }

  // 4) Marcar atividade como concluída
  batch.update(atRef, {
    statusAtividade: "CONCLUIDA",
    fim,
    updatedAt: agora,
  });

  // 5) Commit
  await batch.commit();

  return {
    atividadeId,
    gincanaId: at.gincanaId,
    encerradaEm: fim,
    totalEquipesPontuadas: classificacao.length,
  };
}

module.exports = { encerrarAtividadeEGerarPontuacoes };
