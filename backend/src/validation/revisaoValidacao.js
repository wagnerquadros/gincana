const StatusRevisaoEnum = require("../models/enums/StatusRevisaoEnum");

const LIMITE_ARQUIVOS = 3;
const LIMITE_MB_POR_ARQUIVO = 5;   // 5MB
const LIMITE_MB_TOTAL = 10;        // 10MB
const MOTIVO_MIN = 10;
const MOTIVO_MAX = 500;

function isString(v) {
    return typeof v === "string";
}

function validarCriacaoRevisao(payload) {
    const erros = [];

    // obrigatórios (agora exige equipeAlvoId também)
    const obrigatorios = [
        "gincanaId",
        "atividadeId",
        "equipeId",        // equipe do autor
        "equipeAlvoId",    // equipe que receberá bônus/penalidade
        "autorUsuarioId",
        "motivo",
    ];
    obrigatorios.forEach((campo) => {
        if (!payload[campo] || (isString(payload[campo]) && !String(payload[campo]).trim())) {
            erros.push({ campo, mensagem: "Campo obrigatório." });
        }
    });

    // motivo
    if (payload.motivo) {
        const motivo = String(payload.motivo).trim();
        if (motivo.length < MOTIVO_MIN || motivo.length > MOTIVO_MAX) {
            erros.push({
                campo: "motivo",
                mensagem: `Motivo deve ter entre ${MOTIVO_MIN} e ${MOTIVO_MAX} caracteres.`,
            });
        }
    }

    // status (se vier do cliente, rejeita — sempre nasce ABERTA)
    if (payload.status && payload.status !== StatusRevisaoEnum.ABERTA) {
        erros.push({
            campo: "status",
            mensagem: "Revisão deve ser criada com status ABERTA.",
        });
    }

    return { ok: erros.length === 0, erros };
}

/**
 * Valida arquivos vindos do multer (array de files)
 */
function validarEvidenciasArquivos(files = []) {
    const erros = [];
    if (!Array.isArray(files)) {
        return { ok: false, erros: [{ campo: "evidencias", mensagem: "Formato de arquivos inválido." }] };
    }

    if (files.length > LIMITE_ARQUIVOS) {
        erros.push({
            campo: "evidencias",
            mensagem: `Máximo de ${LIMITE_ARQUIVOS} arquivos permitidos.`,
        });
    }

    let totalBytes = 0;
    files.forEach((f, idx) => {
        totalBytes += Number(f.size || 0);

        const tipo = String(f.mimetype || "");
        const permitido = tipo === "application/pdf" || tipo.startsWith("image/") || tipo.startsWith("video/");
        if (!permitido) {
            erros.push({
                campo: `evidencias[${idx}]`,
                mensagem: `Tipo não permitido (${tipo}). Use imagens, vídeos ou PDF.`,
            });
        }

        const limiteBytes = LIMITE_MB_POR_ARQUIVO * 1024 * 1024;
        if (Number(f.size || 0) > limiteBytes) {
            erros.push({
                campo: `evidencias[${idx}]`,
                mensagem: `Arquivo excede ${LIMITE_MB_POR_ARQUIVO}MB.`,
            });
        }
    });

    const limiteTotal = LIMITE_MB_TOTAL * 1024 * 1024;
    if (totalBytes > limiteTotal) {
        erros.push({
            campo: "evidencias",
            mensagem: `Tamanho total excede ${LIMITE_MB_TOTAL}MB.`,
        });
    }

    return { ok: erros.length === 0, erros };
}

/**
 * Valida mudança de status (PATCH /revisoes/:id/status)
 * payload: { status, parecer?, ajustePontuacao?{bonus, penalidade, totalAntes?, totalDepois?} }
 *
 * NOTA: totalAntes/totalDepois NÃO são mais obrigatórios (backend calcula).
 */
function validarMudancaStatus(payload, revisaoAtual) {
    const erros = [];
    const permitido = new Set(Object.values(StatusRevisaoEnum));

    if (!payload || !payload.status) {
        erros.push({ campo: "status", mensagem: "Status é obrigatório." });
        return { ok: false, erros };
    }
    if (!permitido.has(payload.status)) {
        erros.push({ campo: "status", mensagem: "Status inválido." });
    }

    const de = revisaoAtual?.status;
    const para = payload.status;

    const transicoesPermitidas = {
        ABERTA: new Set([StatusRevisaoEnum.EM_ANALISE, StatusRevisaoEnum.CANCELADA]),
        EM_ANALISE: new Set([StatusRevisaoEnum.DEFERIDA, StatusRevisaoEnum.INDEFERIDA, StatusRevisaoEnum.CANCELADA]),
        DEFERIDA: new Set([]),
        INDEFERIDA: new Set([]),
        CANCELADA: new Set([]),
    };

    if (de && !transicoesPermitidas[de]?.has(para)) {
        erros.push({ campo: "status", mensagem: `Transição não permitida: ${de} → ${para}.` });
    }

    // parecer obrigatório quando finaliza (DEFERIDA/INDEFERIDA)
    if (para === StatusRevisaoEnum.DEFERIDA || para === StatusRevisaoEnum.INDEFERIDA) {
        const p = String(payload.parecer || "").trim();
        if (!p) {
            erros.push({ campo: "parecer", mensagem: "Parecer é obrigatório." });
        }
    }

    // ajustePontuacao obrigatório quando DEFERIDA
    if (para === StatusRevisaoEnum.DEFERIDA) {
        const a = payload.ajustePontuacao || {};
        const temBonus = a.bonus !== undefined && !isNaN(Number(a.bonus));
        const temPenal = a.penalidade !== undefined && !isNaN(Number(a.penalidade));

        if (!temBonus && !temPenal) {
            erros.push({
                campo: "ajustePontuacao",
                mensagem: "Informe pelo menos bonus ou penalidade (numéricos).",
            });
        }

        // Se vierem, devem ser numéricos
        ["bonus", "penalidade", "totalAntes", "totalDepois"].forEach((c) => {
            if (a[c] !== undefined && isNaN(Number(a[c]))) {
                erros.push({
                    campo: `ajustePontuacao.${c}`,
                    mensagem: "Deve ser numérico.",
                });
            }
        });
    }

    return { ok: erros.length === 0, erros };
}

function validarFiltroListagem(query = {}) {
    const erros = [];
    const filtrosPermitidos = new Set(["gincanaId", "atividadeId", "equipeId", "equipeAlvoId", "status", "limit", "startAfter"]);

    Object.keys(query).forEach((k) => {
        if (!filtrosPermitidos.has(k)) {
            erros.push({ campo: k, mensagem: "Filtro não suportado." });
        }
    });

    if (query.status && !Object.values(StatusRevisaoEnum).includes(query.status)) {
        erros.push({ campo: "status", mensagem: "Status inválido." });
    }

    if (query.limit !== undefined) {
        const n = Number(query.limit);
        if (isNaN(n) || n <= 0 || n > 100) {
            erros.push({ campo: "limit", mensagem: "Limit deve ser entre 1 e 100." });
        }
    }

    return { ok: erros.length === 0, erros };
}

module.exports = {
    validarCriacaoRevisao,
    validarEvidenciasArquivos,
    validarMudancaStatus,
    validarFiltroListagem,
    constantes: {
        LIMITE_ARQUIVOS,
        LIMITE_MB_POR_ARQUIVO,
        LIMITE_MB_TOTAL,
        MOTIVO_MIN,
        MOTIVO_MAX,
    },
};
