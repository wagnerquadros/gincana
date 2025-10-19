const express = require("express");
const router = express.Router();
const {
  criarEquipeController,
  listarEquipesController,
  obterEquipeController,
  atualizarEquipeController,
  deletarEquipeController
} = require("../controllers/equipeController.js");

router.post("/", criarEquipeController);
router.get("/", listarEquipesController);
router.get("/:id", obterEquipeController);
router.put("/:id", atualizarEquipeController);
router.delete("/:id", deletarEquipeController);

module.exports = router;
