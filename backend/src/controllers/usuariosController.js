// controllers/usuariosController.js
const RoleEnum = require("../models/enums/RoleEnum");
const {
  getById,
  listAll,
  createUsuario,
  updateUsuario,
  updateSenha,
  softDelete,
} = require("../services/usuariosService");

async function create(req, res) {
  try {
    const { nome, foto, email, senha, role, ativo } = req.body;

    // Permitir ADM e PROFESSOR criar professores, mas somente ADM pode criar ADM
    if (role === RoleEnum.ADM && req.user?.role !== RoleEnum.ADM) {
      return res.status(403).json({ error: "Apenas ADM pode criar outro ADM" });
    }

    if (
      role === RoleEnum.PROFESSOR &&
      ![RoleEnum.ADM, RoleEnum.PROFESSOR].includes(req.user?.role)
    ) {
      return res
        .status(403)
        .json({ error: "Apenas ADM ou PROFESSOR podem criar professores" });
    }

    const novo = await createUsuario({
      nome,
      foto,
      email,
      senha,
      role: role || RoleEnum.ALUNO,
      ativo,
    });

    res.status(201).json(novo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

async function signup(req, res) {
  try {
    let { nome, foto, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ error: "Campos obrigatórios: nome, email, senha" });
    }

    email = String(email).toLowerCase().trim();

    const novo = await createUsuario({
      nome: String(nome).trim(),
      foto: typeof foto === "string" ? foto : null,
      email,
      senha,
      role: RoleEnum.ALUNO,
      ativo: true,
    });

    return res.status(201).json(novo);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}

// ADM lista todos
async function list(req, res) {
  try {
    const { limit, page } = req.query;
    const data = await listAll({
      limit: Number(limit) || 50,
      page: Number(page) || 1,
    });
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// ADM ou o próprio usuário pode visualizar
async function getOne(req, res) {
  try {
    const { id } = req.params;

    if (req.user.role !== RoleEnum.ADM && req.user.id !== id) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const user = await getById(id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const { senha, ...safe } = user;
    return res.json(safe);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// ADM pode alterar qualquer usuário; usuário só altera próprio nome/foto
async function update(req, res) {
  try {
    const { id } = req.params;
    const { nome, foto, role, ativo } = req.body;

    // Se não for ADM, bloqueia mudanças sensíveis e impede editar outros
    if (req.user.role !== RoleEnum.ADM) {
      if (req.user.id !== id) {
        return res.status(403).json({ error: "Acesso negado" });
      }
      if (typeof role !== "undefined" || typeof ativo !== "undefined") {
        return res
          .status(403)
          .json({ error: "Apenas ADM pode alterar role/ativo" });
      }
    } else {
      // ADM alterando role precisa validar enum
      if (typeof role !== "undefined") {
        const roles = Object.values(RoleEnum);
        if (!roles.includes(role)) {
          return res
            .status(400)
            .json({ error: `Role inválida. Use: ${roles.join(", ")}` });
        }
      }
    }

    const updated = await updateUsuario(id, { nome, foto, role, ativo });
    return res.json(updated); // updateUsuario já sanitiza
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}

// Troca de senha: ADM pode trocar a de qualquer usuário; usuário troca a própria
async function changePassword(req, res) {
  try {
    const { id } = req.params;
    const { novaSenha } = req.body;

    if (!novaSenha) return res.status(400).json({ error: "Informe novaSenha" });
    if (String(novaSenha).length < 6) {
      return res
        .status(400)
        .json({ error: "A senha deve ter pelo menos 6 caracteres" });
    }

    if (req.user.role !== RoleEnum.ADM && req.user.id !== id) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    await updateSenha(id, String(novaSenha));
    return res.json({ ok: true, message: "Senha atualizada" });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}

// Exclusão lógica: apenas ADM
async function remove(req, res) {
  try {
    const { id } = req.params;
    if (req.user.role !== RoleEnum.ADM) {
      return res.status(403).json({ error: "Apenas ADM pode remover" });
    }
    await softDelete(id);
    return res.json({ ok: true, message: "Usuário inativado" });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}

module.exports = {
  create, // POST /usuarios (ADM)
  signup, // POST /auth/signup (público -> ALUNO)
  list, // GET /usuarios (ADM)
  getOne, // GET /usuarios/:id (ADM ou o próprio)
  update, // PUT /usuarios/:id (ADM; próprio usuário limitado)
  changePassword, // PATCH /usuarios/:id/senha (ADM ou o próprio)
  remove, // DELETE /usuarios/:id (ADM)
};
