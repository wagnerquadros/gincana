const express = require("express");
const router = express.Router();

const { authMiddleware, authorizeRoles } = require("../middlewares/authMiddleware");
const RoleEnum = require("../models/enums/RoleEnum");
const ctrl = require("../controllers/notificacoesController");

router.use(authMiddleware);

router.get(
  "/",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR, RoleEnum.ALUNO),
  ctrl.list
);

router.post(
  "/",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR),
  ctrl.create
);

module.exports = router;