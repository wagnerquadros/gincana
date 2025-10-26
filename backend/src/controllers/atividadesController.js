const {
  createAtividade,
  listAtividades,
  getAtividade,
  updateAtividade,
  deleteAtividade,
} = require("../services/atividadesService");

const { encerrarAtividadeEGerarPontuacoes } = require("../services/pontuacao");
const { formatarData } = require("../utils/date");

async function create(req, res) {
  try {
    const out = await createAtividade(req.body);
    res.status(201).json(out);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

async function list(req, res) {
  try {
    const { gincanaId, statusAtividade, ativa } = req.query;
    const out = await listAtividades({
      gincanaId,
      statusAtividade,
      ativa: typeof ativa === "undefined" ? undefined : ativa === "true",
    });
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function getOne(req, res) {
  try {
    const out = await getAtividade(req.params.id);
    res.json(out);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
}

async function update(req, res) {
  try {
    const out = await updateAtividade(req.params.id, req.body);
    res.json(out);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

async function encerrarPontuando(req, res) {
  try {
    const { id } = req.params;
    const { classificacao = [], bonus = {}, penalidade = {}, fim } = req.body;

    if (!Array.isArray(classificacao) || classificacao.length === 0) {
      return res.status(400).json({ erro: "Envie a classificação" });
    }

    const r = await encerrarAtividadeEGerarPontuacoes(id, {
      classificacao,
      bonus,
      penalidade,
      fimISO: fim || null,
    });

    return res.json({
      ok: true,
      atividadeId: r.atividadeId,
      gincanaId: r.gincanaId,
      encerradaEm: formatarData(new Date(r.encerradaEm)),
      totalEquipesPontuadas: r.totalEquipesPontuadas,
      mensagem: "Atividade encerrada e pontuações registradas com sucesso.",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: e.message });
  }
}

async function remove(req, res) {
  try {
    const out = await deleteAtividade(req.params.id);
    res.json(out);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

module.exports = { create, list, getOne, update, encerrarPontuando, remove };
