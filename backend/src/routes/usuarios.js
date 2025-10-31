const express = require("express");
const router = express.Router();

const { authMiddleware, authorizeRoles } = require("../middlewares/authMiddleware");
const RoleEnum = require("../models/enums/RoleEnum");
const ctrl = require("../controllers/usuariosController");
const upload = require("../middlewares/uploadMiddleware");

// 🔐 Todas as rotas de /usuarios exigem login
router.use(authMiddleware);

/** Criar usuário (painel) — ADM e PROFESSOR */
router.post("/", authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR), ctrl.create);

/** Listar todos — ADM e PROFESSOR */
router.get("/", authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR), ctrl.list);

/** Obter um — ADM/PROF/ALUNO (ALUNO só vê o próprio no controller) */
router.get(
  "/:id",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR, RoleEnum.ALUNO),
  ctrl.getOne
);

/** Upload de foto — todos logados; regra fina no controller (aluno só o próprio) */
router.post(
  "/:id/foto",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR, RoleEnum.ALUNO),
  upload.single("foto"),
  ctrl.uploadFoto
);

/** Atualizar — ADM/PROF/ALUNO (regras por role no controller) */
router.put(
  "/:id",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR, RoleEnum.ALUNO),
  ctrl.update
);

/** Trocar senha — ADM/PROF/ALUNO (ALUNO só a própria) */
/** Trocar senha — aceita PATCH e POST (para compat com front) */
router.patch(
  "/:id/senha",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR, RoleEnum.ALUNO),
  ctrl.changePassword
);
router.post(
  "/:id/senha",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR, RoleEnum.ALUNO),
  ctrl.changePassword
);

/** Inativar (soft delete) — ADM qualquer; PROFESSOR apenas ALUNO */
router.delete(
  "/:id",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR),
  ctrl.remove
);

/** Relacionado a aluno/equipe (mantido) */
router.patch(
  "/:id/equipe",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR),
  ctrl.updateEquipe
);

router.get(
  "/por-equipe/:equipeId",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR),
  ctrl.listPorEquipe
);

module.exports = router;
