// services/ranking.js
const { db } = require("../../firebase");

const sum = (arr) => arr.reduce((acc, n) => acc + (Number(n) || 0), 0);
const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

async function fetchPontuacoesByIds(ids) {
  if (!ids || ids.length === 0) return new Map();

  const mapa = new Map();
  const lotes = chunk([...new Set(ids)], 10); // Firestore IN máx. 10

  for (const lote of lotes) {
    const qs = await db
      .collection("pontuacoes")
      .where("__name__", "in", lote)
      .get();

    qs.forEach((doc) => {
      mapa.set(doc.id, { id: doc.id, ...doc.data() });
    });
  }

  return mapa;
}

async function calcularRankingGincana(gincanaId) {
  const snap = await db
    .collection("equipes")
    .where("gincanaId", "==", gincanaId)
    .get();

  // 1) Coleta equipes e todos os IDs de pontuação
  const equipes = [];
  const allPontIds = [];

  snap.forEach((doc) => {
    const d = doc.data();

    const pontuacoesIds = Array.isArray(d.pontuacoesIds) ? d.pontuacoesIds : [];
    // suporte legado: se ainda existir o antigo `pontuacoes` com objetos
    const legadoObjs = Array.isArray(d.pontuacoes) ? d.pontuacoes : [];

    if (pontuacoesIds.length) allPontIds.push(...pontuacoesIds);

    equipes.push({
      equipeId: doc.id,
      nome: d.nome,
      pontuacoesIds,
      legadoObjs,
    });
  });

  // 2) Busca as pontuações por ID e indexa
  const pontMap = await fetchPontuacoesByIds(allPontIds);

  // 3) Monta itens do ranking
  const items = equipes.map((eq) => {
    let pontos = 0;
    let bonus = 0;
    let penal = 0;
    let qtdPontuacoes = 0;

    if (eq.pontuacoesIds.length) {
      const docs = eq.pontuacoesIds
        .map((id) => pontMap.get(id))
        .filter(Boolean);
      pontos = sum(docs.map((p) => p.pontosObtidos));
      bonus = sum(docs.map((p) => p.bonus));
      penal = sum(docs.map((p) => p.penalidade));
      qtdPontuacoes = docs.length;
    } else if (eq.legadoObjs.length) {
      // Fallback para dados legados (objetos embutidos)
      pontos = sum(eq.legadoObjs.map((p) => p.pontosObtidos));
      bonus = sum(eq.legadoObjs.map((p) => p.bonus));
      penal = sum(eq.legadoObjs.map((p) => p.penalidade));
      qtdPontuacoes = eq.legadoObjs.length;
    }

    const total = pontos + bonus - penal;

    return {
      equipeId: eq.equipeId,
      nome: eq.nome,
      total,
      detalhes: { pontos, bonus, penalidades: penal, qtdPontuacoes },
    };
  });

  // 4) Ordena e classifica
  items.sort(
    (a, b) => b.total - a.total || (a.nome || "").localeCompare(b.nome || "")
  );
  items.forEach((item, i) => (item.posicao = i + 1));

  return items;
}

module.exports = { calcularRankingGincana };
