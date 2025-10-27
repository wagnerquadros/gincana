const { listAlunos, getAlunoById } = require("../services/usuariosService");

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

module.exports = { list, getOne };
