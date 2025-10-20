const { db } = require("../../firebase");

const sum = (arr) => arr.reduce((acc, n) => acc + (Number(n) || 0), 0);

async function calcularRankingGincana(gincanaId) {
  const snap = await db
    .collection("equipes")
    .where("gincanaId", "==", gincanaId)
    .get();
  const items = [];

  snap.forEach((doc) => {
    const d = doc.data();
    const ps = Array.isArray(d.pontuacoes) ? d.pontuacoes : [];
    const pontos = sum(ps.map((p) => p.pontosObtidos));
    const bonus = sum(ps.map((p) => p.bonus));
    const penal = sum(ps.map((p) => p.penalidade));
    const total = pontos + bonus - penal;

    items.push({
      equipeId: doc.id,
      nome: d.nome,
      total,
      detalhes: { pontos, bonus, penalidades: penal, qtdPontuacoes: ps.length },
    });
  });

  items.sort(
    (a, b) => b.total - a.total || (a.nome || "").localeCompare(b.nome || "")
  );
  items.forEach((item, i) => (item.posicao = i + 1));

  return items;
}

module.exports = { calcularRankingGincana };
