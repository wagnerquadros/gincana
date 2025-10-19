// mocardados_ranking.js
// Rode manualmente: node mocardados_ranking.js
// (não use com nodemon para não duplicar documentos)

const { db } = require("./firebase");
const Gincana = require("./src/models/Gincana");

async function criarGincana(nome, ano, status = "ATIVA") {
  const ref = db.collection("gincanas").doc();
  const g = new Gincana(ref.id, nome, new Date(), null, ano, status);
  await ref.set(g.toObject());
  console.log("✅ Gincana criada:", ref.id);
  return ref.id;
}

async function criarEquipe(gincanaId, nome) {
  const ref = db.collection("equipes").doc();
  const agora = new Date();
  await ref.set({
    gincanaId,
    nome,
    ativo: true,
    pontuacoes: [], // começamos vazio; será preenchido ao encerrar atividades
    criadoEm: agora,
    atualizadoEm: agora,
  });
  console.log("✅ Equipe criada:", nome, "->", ref.id);
  return ref.id;
}

async function criarAtividade(gincanaId, titulo, tipo = "ESPORTIVA") {
  const ref = db.collection("atividades").doc();
  const agora = new Date();

  await ref.set({
    gincanaId,
    titulo,
    descricao: `Descrição de ${titulo}`,
    tipo, // ESPORTIVA | COMPETICAO | QUIZ... (livre)
    inicio: agora, // começa agora
    fim: null, // em andamento => fim null
    pontosPrimeiro: 100,
    pontosSegundo: 75,
    pontosTerceiro: 50,
    criterios: "Critérios simples de avaliação",
    statusAtividade: "EM ANDAMENTO",
    ativa: true,
    createdAt: agora,
    updatedAt: agora,
  });

  console.log("✅ Atividade criada:", titulo, "->", ref.id);
  return ref.id;
}

async function main() {
  console.log("⏳ Iniciando mocagem...");

  // 1) Gincana
  const gincanaId = await criarGincana("Gincana Teste Ranking", 2025, "ATIVA");

  // 2) Equipes (3 equipes)
  const equipePretaId = await criarEquipe(gincanaId, "Equipe Preta");
  const equipeAzulId = await criarEquipe(gincanaId, "Equipe Azul");
  const equipeBrancaId = await criarEquipe(gincanaId, "Equipe Branca");

  // 3) Atividades (5 em andamento)
  const atividades = [];
  for (let i = 1; i <= 5; i++) {
    const atvId = await criarAtividade(
      gincanaId,
      `Atividade ${i}`,
      "ESPORTIVA"
    );
    atividades.push(atvId);
  }

  console.log("\n🎯 IDs para usar no Postman:");
  console.log("- gincanaId:", gincanaId);
  console.log("- equipes:", { equipePretaId, equipeAzulId, equipeBrancaId });
  console.log("- atividades:", atividades);

  console.log("\n🎉 Mocagem concluída com sucesso!");
}

main().catch((err) => {
  console.error("❌ Erro ao mocar dados:", err);
});
