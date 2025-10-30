const express = require("express");
const router = express.Router();

const {
  criarEquipeController,
  listarEquipesController,
  obterEquipeController,
  atualizarEquipeController,
  deletarEquipeController,
  listarEquipesPorGincanaController,
  obterEquipeResumoController,
} = require("../controllers/equipeController");

const {
  authMiddleware,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const RoleEnum = require("../models/enums/RoleEnum");

// exige login em todas as rotas de equipes
router.use(authMiddleware);

// criar equipe — ADM e PROFESSOR
router.post(
  "/",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR),
  criarEquipeController
);

// listar/obter — qualquer logado
router.get(
  "/",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR, RoleEnum.ALUNO),
  listarEquipesController
);

router.get(
  "/:id/resumo",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR, RoleEnum.ALUNO),
  obterEquipeResumoController
);

router.get(
  "/:id",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR, RoleEnum.ALUNO),
  obterEquipeController
);

// atualizar/deletar — ADM e PROFESSOR
router.put(
  "/:id",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR),
  atualizarEquipeController
);
router.delete(
  "/:id",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR),
  deletarEquipeController
);
router.get(
  "/gincana/:gincanaId",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR, RoleEnum.ALUNO),
  listarEquipesPorGincanaController
);



module.exports = router;
