const { db } = require("../../firebase");
const revisaoService = require("../services/revisaoService");
const StatusRevisaoEnum = require("../models/enums/StatusRevisaoEnum");
const { getAtividade } = require("../services/atividadesService");
const { criarNotificacao } = require("../services/notificacoesService");
const { obterEquipePorId } = require("../services/equipeService");
const {
    validarEvidenciasArquivos,
    validarFiltroListagem,
} = require("../validation/revisaoValidacao");

// ===== Helpers de autorização =====
function isADM(role) { return role === "ADM"; }
function isProfessor(role) { return role === "PROFESSOR"; }
function isAluno(role) { return role === "ALUNO"; }
function isProfessorOuAdm(role) { return isADM(role) || isProfessor(role); }

/**
 * Descobre o equipeId do aluno:
 * 1) req.user.equipeId
 * 2) usuarios/{id}
 * 3) fallback: alunos { usuarioId == req.user.id }
 */
async function resolverEquipeDoAluno(req) {
    if (req?.user?.equipeId) return String(req.user.equipeId).trim();

    const userId = req?.user?.id;
    if (!userId) return null;

    const docUsuario = await db.collection("usuarios").doc(String(userId)).get();
    if (docUsuario.exists) {
        const u = docUsuario.data() || {};
        if (u.equipeId) return String(u.equipeId).trim();
    }

    const snapAlunos = await db
        .collection("alunos")
        .where("usuarioId", "==", String(userId))
        .limit(1)
        .get();
    if (!snapAlunos.empty) {
        const d = snapAlunos.docs[0]?.data() || {};
        if (d.equipeId) return String(d.equipeId).trim();
    }

    return null;
}

async function create(req, res) {
    try {
        const body = req.body || {};
        const role = req.user?.role;

        // arquivos (opcional)
        if (Array.isArray(req.files) && req.files.length > 0) {
            const vArqs = validarEvidenciasArquivos(req.files);
            if (!vArqs.ok) {
                return res.status(400).json({ error: "Validação de arquivos falhou", erros: vArqs.erros });
            }
            body.evidencias = req.files.map((f) => ({
                id: f.filename,
                tipo: f.mimetype.startsWith("image/")
                    ? "IMAGEM"
                    : f.mimetype.startsWith("video/")
                        ? "VIDEO"
                        : f.mimetype === "application/pdf"
                            ? "PDF"
                            : "OUTRO",
                path: f.path,
                tamanhoBytes: f.size,
                createdAt: new Date(),
            }));
        }

        // autorização
        if (isAluno(role)) {
            const equipeDoAluno = await resolverEquipeDoAluno(req);
            if (!equipeDoAluno) {
                return res.status(403).json({ error: "Aluno sem equipe vinculada. Não é possível abrir revisão." });
            }
            if (String(body.equipeId).trim() !== String(equipeDoAluno).trim()) {
                return res.status(403).json({ error: "Aluno só pode abrir revisão para a própria equipe." });
            }
            // equipeAlvoId pode ser qualquer equipe da gincana (inclusive a própria)
        } else if (!isProfessorOuAdm(role)) {
            return res.status(403).json({ error: "Perfil sem permissão para criar revisões." });
        }

        const criado = await revisaoService.criarRevisao({
            gincanaId: body.gincanaId,
            atividadeId: body.atividadeId,
            equipeId: body.equipeId,               // autor
            equipeAlvoId: body.equipeAlvoId,       // alvo (pode ser igual ao autor)
            autorUsuarioId: isAluno(role) ? req.user.id : (body.autorUsuarioId || req.user?.id),
            motivo: body.motivo,
            evidencias: body.evidencias || [],
        });

        try {
            const atv = await getAtividade(String(criado.atividadeId));
            const nomeAtv = atv?.titulo || criado.atividadeId;
            const equipeAutor = await obterEquipePorId(String(criado.equipeId)).catch(() => null);
            const equipeAlvo = await obterEquipePorId(String(criado.equipeAlvoId)).catch(() => null);
            const nomeAutor = equipeAutor?.nome || criado.equipeId;
            const nomeAlvo = equipeAlvo?.nome || criado.equipeAlvoId;

            await criarNotificacao({
                gincanaId: String(criado.gincanaId),
                atividadeId: String(criado.atividadeId),
                tipo: "REVISAO_SOLICITADA",
                titulo: `Solicitada Revisão da Atividade ${nomeAtv}`,
                corpo: `Solicitada Revisão da Atividade ${nomeAtv}. Equipe solicitante: '${nomeAutor}' equipe alvo: '${nomeAlvo}'`,
                status: "ENVIADA",
            });
        } catch (e) {
            console.warn("Falha ao criar notificação (revisão solicitada):", e.message);
        }

        return res.status(201).json(criado);
    } catch (e) {
        const status = e.codigo || 500;
        return res.status(status).json({
            error: e.message || "Erro ao criar revisão.",
            erros: e.erros || undefined,
        });
    }
}

async function list(req, res) {
    try {
        const role = req.user?.role;
        const query = { ...req.query };
        const v = validarFiltroListagem(query);
        if (!v.ok) {
            return res.status(400).json({ error: "Filtros inválidos.", erros: v.erros });
        }

        if (isAluno(role)) {
            const equipeDoAluno = await resolverEquipeDoAluno(req);
            if (!equipeDoAluno) {
                return res.status(403).json({ error: "Aluno sem equipe vinculada. Não é possível listar revisões." });
            }
            // força escopo do autor
            query.equipeId = String(equipeDoAluno).trim();
            // (opcional) permitir filtrar por alvo também, se quiser manter query.equipeAlvoId
        } else if (!isProfessorOuAdm(role)) {
            return res.status(403).json({ error: "Perfil sem permissão para listar revisões." });
        }

        const itens = await revisaoService.listar({
            gincanaId: query.gincanaId,
            atividadeId: query.atividadeId,
            equipeId: query.equipeId,
            equipeAlvoId: query.equipeAlvoId,
            status: query.status,
            limit: query.limit,
            startAfter: query.startAfter,
        });

        return res.json(itens);
    } catch (e) {
        const status = e.codigo || 500;
        return res.status(status).json({ error: e.message || "Erro ao listar revisões." });
    }
}

async function getById(req, res) {
    try {
        const role = req.user?.role;
        const { id } = req.params;

        const dado = await revisaoService.obterPorId(id);
        if (!dado) return res.status(404).json({ error: "Revisão não encontrada." });

        if (isAluno(role)) {
            const equipeDoAluno = await resolverEquipeDoAluno(req);
            if (!equipeDoAluno || String(dado.equipeId).trim() !== String(equipeDoAluno).trim()) {
                return res.status(403).json({ error: "Sem permissão para acessar esta revisão." });
            }
        } else if (!isProfessorOuAdm(role)) {
            return res.status(403).json({ error: "Perfil sem permissão para acessar esta revisão." });
        }

        return res.json(dado);
    } catch (e) {
        const status = e.codigo || 500;
        return res.status(status).json({ error: e.message || "Erro ao obter revisão." });
    }
}

async function updateStatus(req, res) {
    try {
        const role = req.user?.role;
        const userId = req.user?.id;
        const { id } = req.params;
        const payload = {
            status: req.body?.status,
            parecer: req.body?.parecer,
            ajustePontuacao: req.body?.ajustePontuacao,
        };

        const atual = await revisaoService.obterPorId(id);
        if (!atual) return res.status(404).json({ error: "Revisão não encontrada." });

        if (payload.status === StatusRevisaoEnum.CANCELADA) {
            if (!(isAluno(role) && userId === atual.autorUsuarioId)) {
                return res.status(403).json({ error: "Apenas o autor (aluno) pode cancelar a revisão." });
            }
        } else {
            if (!isProfessorOuAdm(role)) {
                return res.status(403).json({ error: "Sem permissão para alterar este status." });
            }
        }

        const atualizado = await revisaoService.alterarStatus({
            id,
            status: payload.status,
            parecer: payload.parecer,
            ajustePontuacao: payload.ajustePontuacao,
            usuarioId: userId,
        });

        try {
            const st = String(atualizado?.status || "");
            if (st === StatusRevisaoEnum.DEFERIDA || st === StatusRevisaoEnum.INDEFERIDA) {
                const atv = await getAtividade(String(atualizado.atividadeId));
                const nome = atv?.titulo || atualizado.atividadeId;
                const statusTxt = st.toLowerCase();
                await criarNotificacao({
                    gincanaId: String(atualizado.gincanaId),
                    atividadeId: String(atualizado.atividadeId),
                    tipo: "REVISAO_ENCERRADA",
                    titulo: `Revisão da Atividade ${nome} encerrada`,
                    corpo: `Revisão da Atividade ${nome} encerrada. Status: ${statusTxt}`,
                    status: "ENVIADA",
                });
            }
        } catch (e) {
            console.warn("Falha ao criar notificação (revisão encerrada):", e.message);
        }

        return res.json(atualizado);
    } catch (e) {
        const status = e.codigo || 500;
        return res.status(status).json({
            error: e.message || "Erro ao atualizar status.",
            erros: e.erros || undefined,
        });
    }
}

async function adicionarEvidencia(req, res) {
    try {
        const role = req.user?.role;
        const { id } = req.params;

        const atual = await revisaoService.obterPorId(id);
        if (!atual) return res.status(404).json({ error: "Revisão não encontrada." });

        if (isAluno(role)) {
            const equipeDoAluno = await resolverEquipeDoAluno(req);
            if (!equipeDoAluno || String(atual.equipeId).trim() !== String(equipeDoAluno).trim()) {
                return res.status(403).json({ error: "Sem permissão para anexar evidências nesta revisão." });
            }
        } else if (!isProfessorOuAdm(role)) {
            return res.status(403).json({ error: "Perfil sem permissão para anexar evidências." });
        }

        if (!Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ error: "Nenhum arquivo enviado." });
        }

        const vArqs = validarEvidenciasArquivos(req.files);
        if (!vArqs.ok) {
            return res.status(400).json({ error: "Validação de arquivos falhou", erros: vArqs.erros });
        }

        const evidencias = req.files.map((f) => ({
            id: f.filename,
            tipo: f.mimetype.startsWith("image/")
                ? "IMAGEM"
                : f.mimetype.startsWith("video/")
                    ? "VIDEO"
                    : f.mimetype === "application/pdf"
                        ? "PDF"
                        : "OUTRO",
            path: f.path,
            tamanhoBytes: f.size,
            createdAt: new Date(),
        }));

        const atualizado = await revisaoService.anexarEvidencias(id, evidencias);
        return res.json(atualizado);
    } catch (e) {
        const status = e.codigo || 500;
        return res.status(status).json({ error: e.message || "Erro ao anexar evidências." });
    }
}

module.exports = {
    create,
    list,
    getById,
    updateStatus,
    adicionarEvidencia,
};
