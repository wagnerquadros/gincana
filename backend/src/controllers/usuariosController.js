// src/controllers/usuariosController.js
const RoleEnum = require("../models/enums/RoleEnum");
const {
  listAll,
  getById,
  createUsuario,
  updateUsuario,
  updateSenha,
  softDelete,
  // focados em aluno/equipe (mantidos caso você use essas rotas):
  listAlunos,
  getAlunoById,
  updateAlunoEquipe,
  listAlunosPorEquipe,
} = require("../services/usuariosService");

/* Helpers de role */
function isAdm(user) {
  return (user?.role || "").toUpperCase() === RoleEnum.ADM;
}
function isProfessor(user) {
  return (user?.role || "").toUpperCase() === RoleEnum.PROFESSOR;
}
function isAluno(user) {
  return (user?.role || "").toUpperCase() === RoleEnum.ALUNO;
}

/**
 * POST /usuarios (criar via painel)
 * ADM e PROFESSOR podem criar (se quiser restringir ADM-only, ajuste nas rotas)
 */
async function create(req, res) {
  try {
    // (opcional) impedir professor de criar ADM
    // if (isProfessor(req.user) && (req.body?.role || "").toUpperCase() === RoleEnum.ADM) {
    //   return res.status(403).json({ error: "Somente ADM pode criar ADM" });
    // }

    const novo = await createUsuario(req.body);
    res.status(201).json(novo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

/**
 * POST /auth/signup (público)
 * Cria usuário SEM autenticação, sempre com role = ALUNO e ativo = true
 */
async function signup(req, res) {
  try {
    const { nome, email, senha, foto } = req.body;
    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ error: "Campos obrigatórios: nome, email, senha" });
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
 * GET /usuarios — Lista TODOS os usuários
 * Aceita ?ativo=true|false (opcional)
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
 * GET /usuarios/:id — ADM/PROF podem ver qualquer; ALUNO só vê a si mesmo
 */
async function getOne(req, res) {
  try {
    const alvoId = req.params.id;
    const alvo = await getById(alvoId);
    if (!alvo) return res.status(404).json({ error: "Usuário não encontrado" });

    if (isAluno(req.user) && req.user.id !== alvoId) {
      return res
        .status(403)
        .json({ error: "Sem permissão para acessar este usuário" });
    }
    res.json(alvo);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

/**
 * PUT /usuarios/:id — Atualização com regras por role
 * - ADM: pode alterar qualquer campo (nome, foto, role, ativo)
 * - PROFESSOR: se alvo não for ALUNO, não altera role/ativo
 * - ALUNO: só altera o próprio nome/foto
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
 * PATCH /usuarios/:id/senha — ADM qualquer / Usuário apenas a própria
 */
async function changePassword(req, res) {
  try {
    const alvoId = req.params.id;
    const { senha } = req.body;

    if (!isAdm(req.user) && req.user.id !== alvoId) {
      return res
        .status(403)
        .json({ error: "Sem permissão para trocar a senha" });
    }

    await updateSenha(alvoId, senha);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

/**
 * DELETE /usuarios/:id — Soft delete (inativar)
 * - ADM: qualquer
 * - PROFESSOR: somente ALUNO
 * - Ninguém pode auto-inativar
 */
async function remove(req, res) {
  try {
    const alvoId = req.params.id;
    const solicitante = req.user;

    const alvo = await getById(alvoId);
    if (!alvo) return res.status(404).json({ error: "Usuário não encontrado" });

    if (alvoId === solicitante.id) {
      return res
        .status(403)
        .json({ error: "Você não pode inativar a si mesmo." });
    }

    if (isAdm(solicitante)) {
      // ok
    } else if (isProfessor(solicitante)) {
      if ((alvo.role || "").toUpperCase() !== RoleEnum.ALUNO) {
        return res
          .status(403)
          .json({ error: "Professor só pode inativar alunos." });
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
 * PATCH /usuarios/:id/equipe — (mantido) ADM/PROF definem equipe do aluno
 */
async function updateEquipe(req, res) {
  try {
    const { id } = req.params;
    const { equipeId } = req.body;

    if (!equipeId) {
      return res.status(400).json({ error: "Informe equipeId" });
    }

    const out = await updateAlunoEquipe(id, equipeId);
    return res.json(out);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}

/**
 * GET /usuarios/por-equipe/:equipeId — (mantido)
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

module.exports = {
  // painel
  create,
  list,
  getOne,
  update,
  changePassword,
  remove,

  // aluno/equipe (mantidos)
  updateEquipe,
  listPorEquipe,

  // público
  signup,
};
