// src/routes/revisoes.js
const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/revisaoController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Criar revisão (0..3 evidências em multipart OU JSON puro sem arquivo)
router.post("/", authMiddleware, upload.array("evidencias", 3), ctrl.create);

// Listar revisões (filtros: gincanaId, atividadeId, equipeId=autor, equipeAlvoId=alvo, status, limit, startAfter)
router.get("/", authMiddleware, ctrl.list);

// Obter revisão por ID
router.get("/:id", authMiddleware, ctrl.getById);

// Atualizar status: EM_ANALISE | DEFERIDA | INDEFERIDA | CANCELADA
router.patch("/:id/status", authMiddleware, ctrl.updateStatus);

// Anexar evidências (0..3 arquivos)
router.post("/:id/evidencias", authMiddleware, upload.array("evidencias", 3), ctrl.adicionarEvidencia);

module.exports = router;
