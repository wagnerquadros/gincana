const { listarNotificacoes, criarNotificacao } = require("../services/notificacoesService");

async function list(req, res) {
  try {
    const { gincanaId, limit } = req.query;
    const out = await listarNotificacoes({ gincanaId, limit: Number(limit) || 50 });
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { list };
async function create(req, res) {
  try {
    const { gincanaId, atividadeId = null, titulo, corpo, tipo = "COMUNICADO" } = req.body || {};
    const out = await criarNotificacao({
      gincanaId,
      atividadeId,
      tipo,
      titulo,
      corpo,
      status: "ENVIADA",
    });
    res.status(201).json(out);
  } catch (e) {
    const code = e.codigo || 400;
    res.status(code).json({ error: e.message });
  }
}

module.exports = { list, create };