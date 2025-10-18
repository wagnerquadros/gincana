// mocardados.js (ou o nome que preferir)
// Rode com: node mocardados.js  (não use com nodemon)
const { db } = require("./firebase");
const Gincana = require("./src/models/Gincana");
const { converterData } = require("./src/utils/date");

// (opcional) util pra evitar `undefined` no Firestore
function removerUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  );
}

async function main() {
  console.log("⏳ Iniciando carga de dados...");

  const agora = new Date();

  // 1) GINCANA (dataInicio em yyyy-MM-dd; dataFim vazia => null)
  const gincanaRef = db.collection("gincanas").doc();

  // exemplo de strings ISO simples (pode trocar se quiser):
  const dataInicioISO = "2025-11-10";
  const dataFimISO = "";

  const di = converterData(dataInicioISO);
  const df = converterData(dataFimISO);

  const gincana = new Gincana(
    gincanaRef.id,
    "Gincana Escolar 2025",
    di ?? new Date(),
    df ?? null,
    2025,
    "ATIVA"
  );

  gincana.createdAt = agora;
  gincana.updatedAt = agora;

  await gincanaRef.set(removerUndefined(gincana.toObject()));
  console.log("✅ Gincana criada:", gincanaRef.id);

  // 2) EQUIPES
  const equipePretaRef = db.collection("equipes").doc();
  const equipeBrancaRef = db.collection("equipes").doc();

  await equipePretaRef.set({
    gincanaId: gincanaRef.id,
    nome: "Equipe Preta",
    ativo: true,
    createdAt: agora,
    updatedAt: agora,
  });

  await equipeBrancaRef.set({
    gincanaId: gincanaRef.id,
    nome: "Equipe Branca",
    ativo: true,
    createdAt: agora,
    updatedAt: agora,
  });

  console.log(
    "✅ Equipes criadas:",
    equipePretaRef.id,
    "e",
    equipeBrancaRef.id
  );

  // 3) PROFESSOR (ADM)
  const professorRef = db.collection("usuarios").doc();
  await professorRef.set({
    nome: "Profa. Carla Almeida",
    email: "prof@escola.com",
    senha: "123456",
    foto: "https://i.pravatar.cc/150?img=5",
    role: "ADM",
    ativo: true,
    createdAt: agora,
  });
  console.log("✅ Professor criado:", professorRef.id);

  // 4) ALUNOS
  const aluno1Ref = db.collection("usuarios").doc();
  const aluno2Ref = db.collection("usuarios").doc();

  await aluno1Ref.set({
    nome: "Ana Souza",
    email: "ana@escola.com",
    senha: "123456",
    foto: "https://i.pravatar.cc/150?img=11",
    role: "ALUNO",
    ativo: true,
    createdAt: agora,
  });

  await aluno2Ref.set({
    nome: "João Santos",
    email: "joao@escola.com",
    senha: "123456",
    foto: "https://i.pravatar.cc/150?img=13",
    role: "ALUNO",
    ativo: true,
    createdAt: agora,
  });

  console.log("✅ Alunos criados:", aluno1Ref.id, aluno2Ref.id);

  // 5) VÍNCULOS aluno-equipe (coleção 'alunos')
  const vinculo1Ref = db.collection("alunos").doc();
  const vinculo2Ref = db.collection("alunos").doc();

  await vinculo1Ref.set({
    usuarioId: aluno1Ref.id,
    equipeId: equipePretaRef.id,
    createdAt: agora,
  });

  await vinculo2Ref.set({
    usuarioId: aluno2Ref.id,
    equipeId: equipeBrancaRef.id,
    createdAt: agora,
  });

  console.log("✅ Alunos vinculados às equipes.");

  // 6) ATIVIDADE (início hoje, fim +2 dias)
  const atividadeRef = db.collection("atividades").doc();
  const inicio = new Date();
  const fim = new Date();
  fim.setDate(inicio.getDate() + 2);

  await atividadeRef.set({
    gincanaId: gincanaRef.id,
    titulo: "Corrida de Revezamento",
    descricao: "Atividade esportiva em equipes",
    tipo: "ESPORTIVA",
    inicio,
    fim,
    pontosPrimeiro: 100,
    pontosSegundo: 75,
    pontosTerceiro: 50,
    criterios: "Velocidade, cooperação e estratégia",
    statusAtividade: "EM ANDAMENTO",
    ativa: true,
    createdAt: agora,
    updatedAt: agora,
  });

  console.log("✅ Atividade criada:", atividadeRef.id);

  console.log("🎉 Dados mocados inseridos com sucesso!");
}

main().catch((err) => {
  console.error("❌ Erro ao inserir dados:", err);
});
