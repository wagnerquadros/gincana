const { db, admin } = require("../../firebase");
const Pontuacao = require("../models/Pontuacao");

// helper: número seguro
const num = (v, def = 0) => (typeof v === "number" ? v : def);

async function existeAjustePorRevisao(revisaoId) {
  const qs = await db
    .collection("pontuacoes")
    .where("origem", "==", "AJUSTE_REVISAO")
    .where("revisaoId", "==", String(revisaoId || "").trim())
    .limit(1)
    .get();
  return !qs.empty;
}

// Soma segura
const soma = (arr) => arr.reduce((acc, n) => acc + (Number(n) || 0), 0);

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

const COLL = "pontuacoes";
const isStr = (v) => typeof v === "string" && v.trim().length > 0;

// 🔹 Lista pontuações de uma atividade (apenas 1 where → não exige índice composto)
async function listarPontuacoesPorAtividade(atividadeId) {
  if (!db) throw new Error("Firebase não inicializado");
  if (!isStr(atividadeId)) throw new Error("atividadeId é obrigatório");

  const qs = await db
    .collection(COLL)
    .where("atividadeId", "==", atividadeId.trim())
    .get();

  return qs.docs.map((d) => {
    const p = Pontuacao.fromDoc(d);
    return p?.toObject ? p.toObject() : p;
  });
}

// 🔹 Monta ranking (competition ranking: 1,2,2,4)
async function rankingDaAtividade(atividadeId, { incluirEquipe = true } = {}) {
  const itens = await listarPontuacoesPorAtividade(atividadeId);

  // total = pontosObtidos + bonus - penalidade
  const ordenados = itens
    .map((x) => ({
      ...x,
      total:
        Number(x.pontosObtidos || 0) +
        Number(x.bonus || 0) -
        Number(x.penalidade || 0),
    }))
    .sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      // desempates opcionais
      if ((b.bonus || 0) !== (a.bonus || 0)) return (b.bonus || 0) - (a.bonus || 0);
      if ((a.penalidade || 0) !== (b.penalidade || 0))
        return (a.penalidade || 0) - (b.penalidade || 0);
      return new Date(a.criadoEm || 0) - new Date(b.criadoEm || 0);
    });

  // gera colocação
  let lastTotal = null;
  let lastRank = 0;
  for (let i = 0; i < ordenados.length; i++) {
    const cur = ordenados[i];
    if (lastTotal === null || cur.total !== lastTotal) {
      lastRank = i + 1;
      lastTotal = cur.total;
    }
    cur.colocacao = lastRank;
  }

  // enriquecer com nome da equipe (opcional)
  if (incluirEquipe && ordenados.length > 0) {
    const uniqueEquipeIds = [...new Set(ordenados.map((x) => x.equipeId).filter(isStr))];
    const equipes = {};
    await Promise.all(
      uniqueEquipeIds.map(async (id) => {
        const doc = await db.collection("equipes").doc(id).get();
        if (doc.exists) {
          const d = doc.data();
          equipes[id] = { id: doc.id, nome: d?.nome || null };
        } else {
          equipes[id] = { id, nome: null };
        }
      })
    );
    for (const item of ordenados) {
      item.equipe = equipes[item.equipeId] || null;
    }
  }

  return ordenados.map(
    ({
      id,
      atividadeId,
      equipeId,
      equipe,
      pontosObtidos,
      bonus,
      penalidade,
      total,
      colocacao,
    }) => ({
      id,
      atividadeId,
      equipeId,
      equipe,
      pontosObtidos,
      bonus,
      penalidade,
      total,
      colocacao,
    })
  );
}

// 🔹 Pontuação acumulada de uma equipe dentro de UMA gincana
async function pontuacaoAcumuladaEquipeNaGincana(gincanaId, equipeId) {
  if (!gincanaId || !gincanaId.trim()) throw new Error("gincanaId é obrigatório");
  if (!equipeId || !equipeId.trim()) throw new Error("equipeId é obrigatório");

  // Buscar atividades da gincana
  const atvsSnap = await db
    .collection("atividades")
    .where("gincanaId", "==", gincanaId.trim())
    .get();

  const atividadeIds = atvsSnap.docs.map((d) => d.id);
  if (atividadeIds.length === 0) {
    return {
      gincanaId,
      equipeId,
      total: 0,
      pontos: 0,
      bonus: 0,
      penalidades: 0,
      quantidadePontuacoes: 0,
      detalhes: [],
    };
  }

  // Buscar pontuações da equipe (UM único where → sem índice composto)
  const pontSnap = await db
    .collection("pontuacoes")
    .where("equipeId", "==", equipeId.trim())
    .get();

  // Filtrar apenas as pontuações cuja atividade pertença à gincana
  const setAtividades = new Set(atividadeIds);
  const itens = pontSnap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((p) => setAtividades.has(p.atividadeId));

  const pontos = soma(itens.map((p) => p.pontosObtidos));
  const bonus = soma(itens.map((p) => p.bonus));
  const penal = soma(itens.map((p) => p.penalidade));
  const total = pontos + bonus - penal;

  return {
    gincanaId,
    equipeId,
    total,
    pontos,
    bonus,
    penalidades: penal,
    quantidadePontuacoes: itens.length,
    detalhes: itens.map((p) => ({
      pontuacaoId: p.id,
      atividadeId: p.atividadeId,
      pontosObtidos: p.pontosObtidos || 0,
      bonus: p.bonus || 0,
      penalidade: p.penalidade || 0,
      criadoEm: p.criadoEm || null,
    })),
  };
}


/**
 * Aplica um ajuste de pontuação decorrente de uma revisão DEFERIDA.
 * Estratégia: cria um NOVO documento em "pontuacoes" com origem = "AJUSTE_REVISAO"
 * e adiciona o id na lista equipes.pontuacoesIds (arrayUnion).
 *
 * Não altera pontuações originais de encerramento — mantém auditoria.
 *
 * @param {Object} params
 * @param {string} params.atividadeId
 * @param {string} params.equipeId
 * @param {string} params.revisaoId
 * @param {number} [params.bonus=0]
 * @param {number} [params.penalidade=0]
 * @param {string} [params.observacao="Ajuste deferido por revisão"]
 *
 * @returns {Promise<{ id: string, atividadeId: string, equipeId: string, bonus: number, penalidade: number, total: number }>}
 */
async function aplicarAjustePorRevisao({
  atividadeId,
  equipeId,
  revisaoId,
  bonus = 0,
  penalidade = 0,
  observacao = "Ajuste deferido por revisão",
}) {
  if (!atividadeId || !atividadeId.trim()) throw new Error("atividadeId é obrigatório");
  if (!equipeId || !equipeId.trim()) throw new Error("equipeId é obrigatório");
  if (!revisaoId || !revisaoId.trim()) throw new Error("revisaoId é obrigatório");

  if (await existeAjustePorRevisao(revisaoId)) {
    throw new Error("Ajuste já aplicado para esta revisão.");
  }

  const agora = new Date();

  // Cria doc de pontuação somente com bônus/penalidade (pontosObtidos = 0)
  const pontRef = db.collection("pontuacoes").doc();
  const pontoObj = new Pontuacao(
    pontRef.id,
    equipeId.trim(),
    atividadeId.trim(),
    0,                        // pontosObtidos não muda — ajuste isolado
    Number(bonus || 0),
    Number(penalidade || 0)
  ).toObject();

  // Campos extras para auditoria (não quebram ranking/consultas existentes)
  const payload = {
    ...pontoObj,
    origem: "AJUSTE_REVISAO",
    revisaoId: revisaoId.trim(),
    observacao,
    criadoEm: agora,
    atualizadoEm: agora,
  };

  const batch = db.batch();
  batch.set(pontRef, payload);

  // Atualiza equipe: adiciona id desta pontuação de ajuste
  const equipeRef = db.collection("equipes").doc(equipeId.trim());
  batch.update(equipeRef, {
    pontuacoesIds: admin.firestore.FieldValue.arrayUnion(pontRef.id),
    atualizadoEm: agora,
  });

  await batch.commit();

  // total segue a regra: pontosObtidos(0) + bonus - penalidade
  const total = Number(bonus || 0) - Number(penalidade || 0);

  return {
    id: pontRef.id,
    atividadeId: atividadeId.trim(),
    equipeId: equipeId.trim(),
    bonus: Number(bonus || 0),
    penalidade: Number(penalidade || 0),
    total,

  };
}




module.exports = {
  encerrarAtividadeEGerarPontuacoes,
  listarPontuacoesPorAtividade,
  rankingDaAtividade,
  pontuacaoAcumuladaEquipeNaGincana,
  aplicarAjustePorRevisao,
};