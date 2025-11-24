const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  authorizeRoles,
} = require("../middlewares/authMiddleware"); // 👈 IMPORTANTE
const RoleEnum = require("../models/enums/RoleEnum");
const controller = require("../controllers/atividadesController");
const { rankingPorAtividadeController } = require("../controllers/pontuacaoController");

// 🔐 Protege todas as rotas com login
router.use(authMiddleware);

router.post(
  "/",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR),
  controller.create
);
router.get(
  "/",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR, RoleEnum.ALUNO),
  controller.list
);
router.get(
  "/:id",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR, RoleEnum.ALUNO),
  controller.getOne
);
router.put(
  "/:id",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR),
  controller.update
);
router.patch(
  "/:id/encerrar",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR),
  controller.encerrarPontuando
);
router.delete(
  "/:id",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR),
  controller.remove
);
router.get(
  "/gincana/:gincanaId",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR, RoleEnum.ALUNO),
  controller.listByGincana
);
router.get(
  "/:id/pontuacoes",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR, RoleEnum.ALUNO),
  rankingPorAtividadeController
);


module.exports = router;
