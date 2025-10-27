// routes/authPublic.js (signup público)
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/usuariosController");

// Cadastro público: cria usuário com role ALUNO
router.post("/signup", ctrl.signup);

module.exports = router;
