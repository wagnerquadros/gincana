const { rankingDaAtividade } = require("../services/pontuacao");

const rankingPorAtividadeController = async (req, res) => {
    try {
        const { id } = req.params; // id da atividade
        const { incluirEquipe } = req.query;

        const out = await rankingDaAtividade(id, {
            incluirEquipe: incluirEquipe === "false" ? false : true,
        });

        return res.json(out);
    } catch (err) {
        console.error("ERRO RANKING ATIVIDADE:", err);
        return res.status(400).json({ error: err.message });
    }
};

module.exports = { rankingPorAtividadeController };