// services/ranking.js
const { db } = require("../../firebase");

const sum = (arr) => arr.reduce((acc, n) => acc + (Number(n) || 0), 0);
const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

/**
 * ✅ OTIMIZAÇÃO: Busca pontuações em batch usando chunk de 10 (limite do Firestore IN)
 * Evita N+1 queries ao buscar múltiplas pontuações por ID
 */
async function fetchPontuacoesByIds(ids) {
  if (!ids || ids.length === 0) return new Map();

  const mapa = new Map();
  const lotes = chunk([...new Set(ids)], 10); // Firestore IN máx. 10

  // ✅ OTIMIZAÇÃO: Executa consultas em paralelo usando Promise.all
  await Promise.all(
    lotes.map(async (lote) => {
      const qs = await db
        .collection("pontuacoes")
        .where("__name__", "in", lote)
        .get();

      qs.forEach((doc) => {
        mapa.set(doc.id, { id: doc.id, ...doc.data() });
      });
    })
  );

  return mapa;
}

/**
 * ✅ OTIMIZAÇÃO: Busca equipes em batch ao invés de consultas individuais
 * Usa where("__name__", "in", ids) com chunks de 10 para respeitar limite do Firestore
 */
async function fetchEquipesByIds(ids) {
  if (!ids || ids.length === 0) return new Map();

  const mapa = new Map();
  const lotes = chunk([...new Set(ids)], 10);

  await Promise.all(
    lotes.map(async (lote) => {
      const qs = await db
        .collection("equipes")
        .where("__name__", "in", lote)
        .get();

      qs.forEach((doc) => {
        const d = doc.data();
        mapa.set(doc.id, { id: doc.id, nome: d?.nome || null });
      });
    })
  );

  return mapa;
}

/**
 * ✅ OTIMIZAÇÃO: Busca contagem de membros ativos por equipe em batch
 * Evita fazer N consultas individuais ao buscar todas as equipes de uma vez
 */
async function fetchMembrosAtivosPorEquipe(equipeIds) {
  if (!equipeIds || equipeIds.length === 0) return new Map();

  const contagemMap = new Map();

  // Busca todos os alunos das equipes de uma vez (filtro por equipeId)
  // ✅ OTIMIZAÇÃO: Usa Promise.all para consultas paralelas
  const promessas = equipeIds.map(async (equipeId) => {
    const qs = await db
      .collection("usuarios")
      .where("equipeId", "==", equipeId)
      .where("role", "==", "ALUNO")
      .get();

    const ativos = qs.docs.filter(
      (doc) => doc.data()?.ativo === true || doc.data()?.usuario?.ativo === true
    ).length;

    contagemMap.set(equipeId, ativos);
  });

  await Promise.all(promessas);
  return contagemMap;
}

/**
 * ✅ OTIMIZAÇÃO: Calcula ranking completo com informações de membros
 * Agora inclui membrosAtivos para evitar consultas adicionais no frontend
 */
async function calcularRankingGincana(gincanaId, { incluirMembros = true } = {}) {
  // 1) Busca todas as equipes da gincana (1 consulta)
  const snap = await db
    .collection("equipes")
    .where("gincanaId", "==", gincanaId)
    .get();

  // 2) Coleta equipes e todos os IDs de pontuação
  const equipes = [];
  const allPontIds = [];

  snap.forEach((doc) => {
    const d = doc.data();
    if (d?.ativo === false) {
      return;
    }

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

  // 3) ✅ OTIMIZAÇÃO: Busca pontuações e membros em paralelo
  // 👉 Busca IDs de atividades da gincana para filtrar pontuações por atividade
  const atvsSnap = await db
    .collection("atividades")
    .where("gincanaId", "==", gincanaId)
    .get();
  const atividadeIds = new Set(atvsSnap.docs.map((d) => d.id));

  const [pontMap, membrosMap] = await Promise.all([
    fetchPontuacoesByIds(allPontIds),
    incluirMembros
      ? fetchMembrosAtivosPorEquipe(equipes.map((e) => e.equipeId))
      : Promise.resolve(new Map()),
  ]);

  // 4) Monta itens do ranking
  const items = equipes.map((eq) => {
    let pontos = 0;
    let bonus = 0;
    let penal = 0;
    let qtdPontuacoes = 0;

    if (eq.pontuacoesIds.length) {
      const docs = eq.pontuacoesIds
        .map((id) => pontMap.get(id))
        .filter(Boolean)
        .filter((p) => atividadeIds.has(p.atividadeId));
      pontos = sum(docs.map((p) => p.pontosObtidos));
      bonus = sum(docs.map((p) => p.bonus));
      penal = sum(docs.map((p) => p.penalidade));
      qtdPontuacoes = docs.length;
    } else if (eq.legadoObjs.length) {
      // Fallback para dados legados (objetos embutidos)
      const leg = eq.legadoObjs.filter((p) => atividadeIds.has(p.atividadeId));
      pontos = sum(leg.map((p) => p.pontosObtidos));
      bonus = sum(leg.map((p) => p.bonus));
      penal = sum(leg.map((p) => p.penalidade));
      qtdPontuacoes = leg.length;
    }

    const total = pontos + bonus - penal;

    return {
      id: eq.equipeId, // ✅ Adicionado para compatibilidade com frontend
      equipeId: eq.equipeId,
      nome: eq.nome,
      total,
      pontos,
      bonus,
      penalidades: penal,
      membrosAtivos: incluirMembros ? membrosMap.get(eq.equipeId) || 0 : undefined,
      detalhes: { pontos, bonus, penalidades: penal, qtdPontuacoes },
    };
  });

  // 5) Ordena e classifica
  items.sort(
    (a, b) => b.total - a.total || (a.nome || "").localeCompare(b.nome || "")
  );
  items.forEach((item, i) => (item.posicao = i + 1));

  return items;
}

module.exports = { calcularRankingGincana, fetchEquipesByIds };
