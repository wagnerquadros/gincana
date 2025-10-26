// src/controllers/equipeController.js
const {
  criarEquipe,
  listarEquipes,
  obterEquipePorId,
  atualizarEquipe,
  deletarEquipe,
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

module.exports = {
  criarEquipeController,
  listarEquipesController,
  obterEquipeController,
  atualizarEquipeController,
  deletarEquipeController,
};
