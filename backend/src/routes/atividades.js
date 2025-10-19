const express = require("express");
const router = express.Router();
const { encerrarAtividadeEGerarPontuacoes } = require("../services/pontuacao");
const { formatarData } = require("../utils/date");

/**
 * PATCH /atividades/:id/encerrar
 * Body JSON:
 * {
 *   "classificacao": ["<EQUIPE_PRETA_ID>", "<EQUIPE_AZUL_ID>", "<EQUIPE_BRANCA_ID>"],
 *   "bonus": { "<EQUIPE_PRETA_ID>": 10 },         // opcional
 *   "penalidade": { "<EQUIPE_BRANCA_ID>": 5 },    // opcional
 *   "fim": "2025-11-20"                           // opcional
 * }
 */
router.patch("/:id/encerrar", async (req, res) => {
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
});

module.exports = router;
