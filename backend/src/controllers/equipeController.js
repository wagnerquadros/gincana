const { pontuacaoAcumuladaEquipeNaGincana } = require("../services/pontuacao");
const { listAlunosPorEquipe } = require("../services/usuariosService");
const {
  criarEquipe,
  listarEquipes,
  obterEquipePorId,
  atualizarEquipe,
  deletarEquipe,
  listarEquipesPorGincana,
} = require("../services/equipeService");

const criarEquipeController = async (req, res) => {
  try {
    const equipe = await criarEquipe(req.body);
    res.status(201).json(equipe);
  } catch (err) {
    console.error("ERRO CRIAR EQUIPE:", err);
    res.status(400).json({ error: err.message });
  }
};

const listarEquipesController = async (_req, res) => {
  try {
    const equipes = await listarEquipes();
    res.json(equipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const obterEquipeController = async (req, res) => {
  try {
    const equipe = await obterEquipePorId(req.params.id);
    res.json(equipe);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const atualizarEquipeController = async (req, res) => {
  try {
    const equipe = await atualizarEquipe(req.params.id, req.body);
    res.json(equipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deletarEquipeController = async (req, res) => {
  try {
    const result = await deletarEquipe(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const listarEquipesPorGincanaController = async (req, res) => {
  try {
    const { gincanaId } = req.params;
    const { ativo } = req.query;

    const out = await listarEquipesPorGincana({
      gincanaId,
      ativo: typeof ativo === "undefined" ? undefined : ativo === "true",
    });

    res.json(out);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obterEquipeResumoController = async (req, res) => {
  try {
    const equipe = await obterEquipePorId(req.params.id);
    if (!equipe) {
      return res.status(404).json({ error: "Equipe não encontrada" });
    }
    // ✅ retorna apenas o nome
    return res.json({ nome: equipe.nome });
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
};

// 🔹 GET /equipes/:id/pontuacao/gincana/:gincanaId
const pontuacaoEquipeNaGincanaController = async (req, res) => {
  try {
    const { id, gincanaId } = req.params;
    const out = await pontuacaoAcumuladaEquipeNaGincana(gincanaId, id);
    return res.json(out);
  } catch (err) {
    console.error("ERRO PONTUAÇÃO EQUIPE/GINCANA:", err);
    return res.status(400).json({ error: err.message });
  }
};

// 🔹 GET /equipes/:id/membros/contagem?ativo=true|false (opcional)
const contagemMembrosController = async (req, res) => {
  try {
    const { id } = req.params;
    const { ativo } = req.query;

    // Busca todos os alunos da equipe (sem filtro) para termos ambos os totais
    const alunosTodos = await listAlunosPorEquipe(id, { ativo: undefined });
    const totalMembros = Array.isArray(alunosTodos) ? alunosTodos.length : 0;

    const totalAtivos = alunosTodos.filter((a) => a?.usuario?.ativo === true || a?.ativo === true).length;
    const totalInativos = totalMembros - totalAtivos;

    // Se o cliente quiser receber também a lista filtrada (opcional)
    let filtrados = undefined;
    if (typeof ativo !== "undefined") {
      const flag = ativo === "true";
      filtrados = alunosTodos.filter((a) =>
        (a?.usuario?.ativo ?? a?.ativo ?? false) === flag
      );
    }

    return res.json({
      equipeId: id,
      totalMembros,
      totalAtivos,
      totalInativos,
      ...(typeof ativo !== "undefined" ? { filtroAtivo: ativo === "true", membros: filtrados } : {}),
    });
  } catch (err) {
    console.error("ERRO CONTAGEM MEMBROS:", err);
    return res.status(400).json({ error: err.message });
  }
};


module.exports = {
  criarEquipeController,
  listarEquipesController,
  obterEquipeController,
  atualizarEquipeController,
  deletarEquipeController,
  listarEquipesPorGincanaController,
  obterEquipeResumoController,
  pontuacaoEquipeNaGincanaController,
  contagemMembrosController,
};
