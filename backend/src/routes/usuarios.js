// routes/usuarios.js
const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const RoleEnum = require("../models/enums/RoleEnum");
const ctrl = require("../controllers/usuariosController");

// Todas as rotas de /usuarios exigem login
router.use(authMiddleware);

// ADM cria usuário (qualquer role)
router.post("/", authorizeRoles(RoleEnum.ADM), ctrl.create);

// ADM lista todos
router.get("/", authorizeRoles(RoleEnum.ADM), ctrl.list);

// ADM ou o próprio usuário
router.get("/:id", ctrl.getOne);

// Atualiza: ADM total; usuário pode mudar nome/foto próprios
router.put("/:id", ctrl.update);

// Troca senha: ADM ou o próprio
router.patch("/:id/senha", ctrl.changePassword);

// Inativar usuário: somente ADM
router.delete("/:id", authorizeRoles(RoleEnum.ADM), ctrl.remove);

module.exports = router;
