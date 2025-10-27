const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const RoleEnum = require("../models/enums/RoleEnum");
const ctrl = require("../controllers/alunosController");

// exige login
router.use(authMiddleware);

// apenas ADM e PROFESSOR podem acessar
router.get("/", authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR), ctrl.list);
router.get(
  "/:id",
  authorizeRoles(RoleEnum.ADM, RoleEnum.PROFESSOR),
  ctrl.getOne
);

module.exports = router;
