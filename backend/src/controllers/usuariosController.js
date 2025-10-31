const RoleEnum = require("../models/enums/RoleEnum");

// 👉 Importa o service UMA ÚNICA VEZ e faz alias do updateSenha
const usuariosService = require("../services/usuariosService");
const {
  listAll,
  getById,
  createUsuario,
  updateUsuario,
  updateSenha: serviceUpdateSenha,  // <-- alias para evitar conflito
  softDelete,
  listAlunosPorEquipe,
  updateAlunoEquipe,
} = usuariosService;

/* Helpers */
function isAdm(user) { return (user?.role || "").toUpperCase() === RoleEnum.ADM; }
function isProfessor(user) { return (user?.role || "").toUpperCase() === RoleEnum.PROFESSOR; }
function isAluno(user) { return (user?.role || "").toUpperCase() === RoleEnum.ALUNO; }

/**
 * POST /usuarios (criar via painel)
 */
async function create(req, res) {
  try {
    const novo = await createUsuario(req.body);
    res.status(201).json(novo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

/**
 * POST /auth/signup (público)
 */
async function signup(req, res) {
  try {
    const { nome, email, senha, foto } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Campos obrigatórios: nome, email, senha" });
    }
    const novo = await createUsuario({
      nome,
      email,
      senha,
      foto: typeof foto === "string" ? foto : null,
      role: RoleEnum.ALUNO,
      ativo: true,
    });
    res.status(201).json(novo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

/**
 * GET /usuarios
 */
async function list(req, res) {
  try {
    const { ativo } = req.query;
    const todos = await listAll();
    let out = todos;
    if (typeof ativo !== "undefined") {
      const flag = ativo === "true";
      out = todos.filter((u) => !!u.ativo === flag);
    }
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

/**
 * GET /usuarios/:id
 */
async function getOne(req, res) {
  try {
    const alvoId = req.params.id;
    const alvo = await getById(alvoId);
    if (!alvo) return res.status(404).json({ error: "Usuário não encontrado" });

    if (isAluno(req.user) && req.user.id !== alvoId) {
      return res.status(403).json({ error: "Sem permissão para acessar este usuário" });
    }
    res.json(alvo);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

/**
 * PUT /usuarios/:id
 */
async function update(req, res) {
  try {
    const alvoId = req.params.id;
    const body = { ...req.body };

    const atual = await getById(alvoId);
    if (!atual) return res.status(404).json({ error: "Usuário não encontrado" });

    if (isAdm(req.user)) {
      // full access
    } else if (isProfessor(req.user)) {
      if ((atual.role || "").toUpperCase() !== RoleEnum.ALUNO) {
        delete body.role;
        delete body.ativo;
      }
    } else if (isAluno(req.user)) {
      if (req.user.id !== alvoId) {
        return res.status(403).json({ error: "Sem permissão" });
      }
      delete body.role;
      delete body.ativo;
    }

    const up = await updateUsuario(alvoId, body);
    res.json(up);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

/**
 * PATCH/POST /usuarios/:id/senha
 */
async function changePassword(req, res) {
  try {
    const alvoId = String(req.params.id || "");
    const { senhaAtual, novaSenha, confirmarNovaSenha } = req.body || {};

    if (!novaSenha || !confirmarNovaSenha) {
      return res.status(400).json({ error: "Informe novaSenha e confirmarNovaSenha" });
    }
    if (novaSenha !== confirmarNovaSenha) {
      return res.status(400).json({ error: "As senhas não conferem" });
    }
    if (!senhaAtual) {
      return res.status(400).json({ error: "Informe senhaAtual" });
    }

    // Confirma que o usuário existe
    const alvo = await getById(alvoId);
    if (!alvo) return res.status(404).json({ error: "Usuário não encontrado" });

    // ✅ Verifica a senha atual SEMPRE antes de trocar
    const ok = await usuariosService.verificarSenhaAtual(alvoId, senhaAtual);
    if (!ok) {
      return res.status(400).json({ error: "Senha atual incorreta" });
    }

    // Troca de senha (hash dentro do service)
    await usuariosService.updateSenha(alvoId, novaSenha);
    return res.json({ ok: true });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}



/**
 * DELETE /usuarios/:id
 */
async function remove(req, res) {
  try {
    const alvoId = req.params.id;
    const solicitante = req.user;

    const alvo = await getById(alvoId);
    if (!alvo) return res.status(404).json({ error: "Usuário não encontrado" });

    if (alvoId === solicitante.id) {
      return res.status(403).json({ error: "Você não pode inativar a si mesmo." });
    }

    if (isAdm(solicitante)) {
      // ok
    } else if (isProfessor(solicitante)) {
      if ((alvo.role || "").toUpperCase() !== RoleEnum.ALUNO) {
        return res.status(403).json({ error: "Professor só pode inativar alunos." });
      }
    } else {
      return res.status(403).json({ error: "Sem permissão." });
    }

    await softDelete(alvoId);
    res.json({ ok: true, id: alvoId });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

/**
 * PATCH /usuarios/:id/equipe
 */
async function updateEquipe(req, res) {
  try {
    const { id } = req.params;
    const { equipeId } = req.body;
    if (!equipeId) return res.status(400).json({ error: "Informe equipeId" });

    const out = await updateAlunoEquipe(id, equipeId);
    return res.json(out);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}

/**
 * GET /usuarios/por-equipe/:equipeId
 */
async function listPorEquipe(req, res) {
  try {
    const { equipeId } = req.params;
    const { ativo } = req.query;
    const out = await listAlunosPorEquipe(equipeId, {
      ativo: typeof ativo === "undefined" ? undefined : ativo === "true",
    });
    return res.json(out);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}

/**
 * POST /usuarios/:id/foto
 */
async function uploadFoto(req, res) {
  try {
    const id = req.params.id;

    if (isAluno(req.user) && req.user.id !== id) {
      return res.status(403).json({ error: "Sem permissão para enviar foto para outro usuário" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const urlRelativa = `/uploads/usuarios/${req.file.filename}`;
    const atualizado = await updateUsuario(id, { foto: urlRelativa });

    res.json({
      mensagem: "Foto enviada com sucesso",
      url: urlRelativa,
      usuario: atualizado,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  // painel
  create,
  list,
  getOne,
  update,
  changePassword,
  remove,

  // aluno/equipe
  updateEquipe,
  listPorEquipe,

  // upload
  uploadFoto,

  // público
  signup,
};
