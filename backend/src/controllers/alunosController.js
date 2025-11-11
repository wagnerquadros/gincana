const { listAlunos, getAlunoById, updateAlunoEquipe, listAlunosPorEquipe } = require("../services/usuariosService");

async function list(req, res) {
  try {
    const { limit, page, ativo } = req.query;
    const data = await listAlunos({
      limit: Number(limit) || 50,
      page: Number(page) || 1,
      ativo: typeof ativo === "undefined" ? undefined : ativo === "true",
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function getOne(req, res) {
  try {
    const aluno = await getAlunoById(req.params.id);
    if (!aluno) return res.status(404).json({ error: "Aluno não encontrado" });
    res.json(aluno);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// PATCH /alunos/:id/equipe  (ADM, PROFESSOR e ALUNO - apenas sua própria equipe)
async function updateEquipe(req, res) {
  try {
    const { id } = req.params;
    const { equipeId } = req.body;
    const userId = req.user?.id;

    if (!equipeId) {
      return res.status(400).json({ error: "Informe equipeId" });
    }

    // Se for ALUNO, só pode atualizar sua própria equipe
    if (req.user?.role === "ALUNO" && userId !== id) {
      return res.status(403).json({ error: "Você só pode atualizar sua própria equipe" });
    }

    const out = await updateAlunoEquipe(id, equipeId);
    return res.json(out);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}

// GET /alunos/por-equipe/:equipeId  (ADM e PROFESSOR)
async function listPorEquipe(req, res) {
  try {
    const { equipeId } = req.params;
    const { ativo } = req.query;

    const out = await listAlunosPorEquipe(equipeId, {
      ativo: typeof ativo === "undefined" ? undefined : ativo === "true",
    });

    return res.json(out);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}


module.exports = {
  list, getOne, updateEquipe,
  listPorEquipe,
};
