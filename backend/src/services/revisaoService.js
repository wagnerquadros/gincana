const { db } = require("../../firebase");
const Revisao = require("../models/Revisao");
const StatusRevisaoEnum = require("../models/enums/StatusRevisaoEnum");
const {
    validarCriacaoRevisao,
    validarMudancaStatus,
} = require("../validation/revisaoValidacao");

const {
    aplicarAjustePorRevisao,
    pontuacaoAcumuladaEquipeNaGincana,
} = require("./pontuacao"); // já existe no teu projeto

function col() {
    return db.collection("revisoes");
}

async function obterPorId(id) {
    const snap = await col().doc(id).get();
    if (!snap.exists) return null;
    return Revisao.fromFirestore(snap).toObject();
}

async function existeAbertaOuEmAnalise(atividadeId, equipeId, equipeAlvoId) {
    let q = col()
        .where("atividadeId", "==", String(atividadeId))
        .where("equipeId", "==", String(equipeId))
        .where("status", "in", [StatusRevisaoEnum.ABERTA, StatusRevisaoEnum.EM_ANALISE]);

    // Estrito por alvo para evitar múltiplas revisões iguais contra o mesmo alvo
    if (equipeAlvoId) q = q.where("equipeAlvoId", "==", String(equipeAlvoId));

    const snap = await q.limit(1).get();
    return !snap.empty;
}

async function criarRevisao(payload) {
    const v = validarCriacaoRevisao(payload);
    if (!v.ok) {
        const error = new Error("Validação falhou.");
        error.codigo = 400;
        error.erros = v.erros;
        throw error;
    }

    const jaExiste = await existeAbertaOuEmAnalise(
        payload.atividadeId,
        payload.equipeId,
        payload.equipeAlvoId
    );
    if (jaExiste) {
        const error = new Error(
            "Já existe revisão ABERTA/EM_ANALISE para esta combinação (atividade/equipe autor/alvo)."
        );
        error.codigo = 409;
        throw error;
    }

    const entity = new Revisao({
        ...payload,
        status: StatusRevisaoEnum.ABERTA,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
    });

    const ref = await col().add(entity.toFirestore());
    const salvo = await ref.get();
    return Revisao.fromFirestore(salvo).toObject();
}

async function listar(filtros = {}) {
    // ✅ Evita exigir índice composto: usa no máximo 1 where
    let q = col();
    if (filtros.gincanaId) q = q.where("gincanaId", "==", String(filtros.gincanaId));

    const snap = await q.get();
    let items = [];
    snap.forEach((doc) => items.push(Revisao.fromFirestore(doc).toObject()));

    // 🔹 Filtros em memória (sem exigir índices compostos)
    if (filtros.atividadeId) items = items.filter((x) => String(x.atividadeId) === String(filtros.atividadeId));
    if (filtros.equipeId) items = items.filter((x) => String(x.equipeId) === String(filtros.equipeId));
    if (filtros.equipeAlvoId) items = items.filter((x) => String(x.equipeAlvoId) === String(filtros.equipeAlvoId));
    if (filtros.status) items = items.filter((x) => String(x.status) === String(filtros.status));

    // 🔹 startAfter (por data)
    if (filtros.startAfter) {
        const d = new Date(filtros.startAfter);
        if (!isNaN(d.getTime())) {
            items = items.filter((x) => {
                const dt = new Date(x.criadoEm);
                return !isNaN(dt.getTime()) && dt > d;
            });
        }
    }

    // 🔹 Ordena por criadoEm desc e aplica limite
    items.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

    let limit = 20;
    if (filtros.limit !== undefined) {
        const n = Number(filtros.limit);
        if (!isNaN(n) && n > 0 && n <= 100) limit = n;
    }
    return items.slice(0, limit);
}

/**
 * Quando DEFERIDA:
 *  - calcula totalAntes/totalDepois AUTOMATICAMENTE se não vier no payload
 *  - aplica ajuste na EQUIPE ALVO (pode ser a mesma equipe do autor, se for bônus)
 */
async function alterarStatus({ id, status, parecer, ajustePontuacao, usuarioId }) {
    const ref = col().doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
        const error = new Error("Revisão não encontrada.");
        error.codigo = 404;
        throw error;
    }

    const atual = Revisao.fromFirestore(snap);
    const v = validarMudancaStatus({ status, parecer, ajustePontuacao }, atual);
    if (!v.ok) {
        const error = new Error("Validação falhou.");
        error.codigo = 400;
        error.erros = v.erros;
        throw error;
    }

    if (status === StatusRevisaoEnum.EM_ANALISE) {
        atual.marcarEmAnalise(usuarioId);

    } else if (status === StatusRevisaoEnum.DEFERIDA) {
        // calcula totais se não vieram
        let aj = ajustePontuacao || {};
        const alvoId = String(atual.equipeAlvoId || atual.equipeId);

        if (!Number.isFinite(Number(aj.totalAntes)) || !Number.isFinite(Number(aj.totalDepois))) {
            // soma atual da equipe ALVO na GINCANA
            const acc = await pontuacaoAcumuladaEquipeNaGincana(String(atual.gincanaId), alvoId);
            const totalAntes = Number(acc?.total || 0);
            const delta = Number(aj.bonus || 0) - Number(aj.penalidade || 0);
            const totalDepois = totalAntes + delta;

            aj = {
                bonus: Number(aj.bonus || 0),
                penalidade: Number(aj.penalidade || 0),
                totalAntes,
                totalDepois,
            };
        }

        // marca DEFERIDA com resumo de ajuste
        atual.deferir({ parecer, ajustePontuacao: aj, usuarioId });

        // aplica o lançamento de ajuste na equipe ALVO
        await aplicarAjustePorRevisao({
            atividadeId: String(atual.atividadeId),
            equipeId: String(atual.equipeAlvoId || atual.equipeId),
            revisaoId: String(atual.id),
            bonus: Number(aj.bonus || 0),
            penalidade: Number(aj.penalidade || 0),
            observacao: "Ajuste deferido por revisão (aplicado à equipe alvo).",
        });

    } else if (status === StatusRevisaoEnum.INDEFERIDA) {
        atual.indeferir({ parecer, usuarioId });

    } else if (status === StatusRevisaoEnum.CANCELADA) {
        atual.cancelar(usuarioId);

    } else {
        const error = new Error("Status de destino inválido para alteração.");
        error.codigo = 400;
        throw error;
    }

    const payload = atual.toFirestore();
    payload.atualizadoEm = new Date();
    await ref.update(payload);

    const atualizado = await ref.get();
    return Revisao.fromFirestore(atualizado).toObject();
}

async function anexarEvidencias(id, evidencias = []) {
    const ref = col().doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
        const error = new Error("Revisão não encontrada.");
        error.codigo = 404;
        throw error;
    }

    const atual = Revisao.fromFirestore(snap);
    evidencias.forEach((ev) => atual.adicionarEvidencia(ev));

    const payload = atual.toFirestore();
    payload.atualizadoEm = new Date();

    await ref.update(payload);
    const atualizado = await ref.get();
    return Revisao.fromFirestore(atualizado).toObject();
}

module.exports = {
    obterPorId,
    criarRevisao,
    listar,
    alterarStatus,
    anexarEvidencias,
};
