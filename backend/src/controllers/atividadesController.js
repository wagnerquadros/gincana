const {
  createAtividade,
  listAtividades,
  getAtividade,
  updateAtividade,
  deleteAtividade,
} = require("../services/atividadesService");

const { encerrarAtividadeEGerarPontuacoes } = require("../services/pontuacao");
const { formatarData } = require("../utils/date");
const { criarNotificacao } = require("../services/notificacoesService");

async function create(req, res) {
  try {
    const out = await createAtividade(req.body);
    try {
      await criarNotificacao({
        gincanaId: out.gincanaId,
        atividadeId: out.id,
        tipo: "ATIVIDADE_AGENDADA",
        titulo: `Agendada a Atividade ${out.titulo}`,
        corpo: `Agendada a Atividade ${out.titulo}`,
        status: "ENVIADA",
      });
    } catch (e) {
      console.warn("Falha ao criar notificação (agendada):", e.message);
    }
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
    try {
      if ((req.body?.statusAtividade || "").toUpperCase() === "EM ANDAMENTO") {
        await criarNotificacao({
          gincanaId: out.gincanaId,
          atividadeId: out.id,
          tipo: "ATIVIDADE_INICIADA",
          titulo: `Iniciada a atividade ${out.titulo}`,
          corpo: `Iniciada a atividade ${out.titulo}`,
          status: "ENVIADA",
        });
      }
    } catch (e) {
      console.warn("Falha ao criar notificação (iniciada):", e.message);
    }
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

    const payload = {
      ok: true,
      atividadeId: r.atividadeId,
      gincanaId: r.gincanaId,
      encerradaEm: formatarData(new Date(r.encerradaEm)),
      totalEquipesPontuadas: r.totalEquipesPontuadas,
      mensagem: "Atividade encerrada e pontuações registradas com sucesso.",
    };

    try {
      const atv = await getAtividade(r.atividadeId);
      const titulo = atv?.titulo || r.atividadeId;
      await criarNotificacao({
        gincanaId: r.gincanaId,
        atividadeId: r.atividadeId,
        tipo: "ATIVIDADE_CONCLUIDA",
        titulo: `Concluída a atividade ${titulo}`,
        corpo: `Concluída a atividade ${titulo}. Confira a pontuação`,
        status: "ENVIADA",
      });
    } catch (e) {
      console.warn("Falha ao criar notificação (concluída):", e.message);
    }

    return res.json(payload);
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

async function listByGincana(req, res) {
  try {
    const { gincanaId } = req.params;
    const { statusAtividade, ativa } = req.query;

    if (!gincanaId || !gincanaId.trim()) {
      return res.status(400).json({ error: "gincanaId é obrigatório" });
    }

    const out = await listAtividades({
      gincanaId: gincanaId.trim(),
      statusAtividade,
      ativa: typeof ativa === "undefined" ? undefined : ativa === "true",
    });

    return res.json(out);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

module.exports = { create, list, getOne, update, encerrarPontuando, remove, listByGincana };
