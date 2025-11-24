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
  pontuacaoEquipeNaGincanaController,
  contagemMembrosController,
  listarMembrosEquipeController,
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
// Pontuação da equipe em uma gincana específica
router.get(
  "/:id/pontuacao/gincana/:gincanaId",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR, RoleEnum.ALUNO),
  pontuacaoEquipeNaGincanaController
);

// Lista membros da equipe (ALUNO pode ver membros da sua equipe)
// IMPORTANTE: Esta rota deve vir ANTES de /:id/membros/contagem para evitar conflito
router.get(
  "/:id/membros",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR, RoleEnum.ALUNO),
  listarMembrosEquipeController
);

// Contagem de membros da equipe (com totais ativos/inativos)
router.get(
  "/:id/membros/contagem",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR, RoleEnum.ALUNO),
  contagemMembrosController
);


module.exports = router;
