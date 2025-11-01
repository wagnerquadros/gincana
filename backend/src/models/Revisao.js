const StatusRevisaoEnum = require("./enums/StatusRevisaoEnum");
const TipoEvidenciaEnum = require("./enums/TipoEvidenciaEnum");

function paraDate(valor) {
    if (!valor) return null;
    if (valor instanceof Date) return valor;
    if (typeof valor === "object" && typeof valor.toDate === "function") {
        return valor.toDate();
    }
    if (typeof valor === "string") {
        const d = new Date(valor);
        return isNaN(d.getTime()) ? null : d;
    }
    return null;
}

/**
 * @typedef {Object} Evidencia
 * @property {string} id
 * @property {("IMAGEM"|"VIDEO"|"PDF"|"OUTRO")} tipo
 * @property {string} path
 * @property {number} tamanhoBytes
 * @property {Date|string|Object} createdAt
 */

class Revisao {
    /**
     * @param {Object} props
     * @param {string|null} props.id
     * @param {string} props.gincanaId
     * @param {string} props.atividadeId
     * @param {string} props.equipeId          // equipe do autor
     * @param {string} props.equipeAlvoId      // equipe a ser investigada/ajustada
     * @param {string} props.autorUsuarioId
     * @param {string} props.motivo
     * @param {Array<Evidencia>} [props.evidencias]
     * @param {("ABERTA"|"EM_ANALISE"|"DEFERIDA"|"INDEFERIDA"|"CANCELADA")} [props.status]
     * @param {string|null} [props.parecer]
     * @param {string|null} [props.analisadoPorUsuarioId]
     * @param {boolean} [props.impactouPontuacao]
     * @param {{bonus:number, penalidade:number, totalAntes:number, totalDepois:number}|null} [props.ajustePontuacao]
     * @param {Date|string|Object} [props.criadoEm]
     * @param {Date|string|Object} [props.atualizadoEm]
     */
    constructor({
        id = null,
        gincanaId,
        atividadeId,
        equipeId,
        equipeAlvoId,
        autorUsuarioId,
        motivo,
        evidencias = [],
        status = StatusRevisaoEnum.ABERTA,
        parecer = null,
        analisadoPorUsuarioId = null,
        impactouPontuacao = false,
        ajustePontuacao = null,
        criadoEm = new Date(),
        atualizadoEm = new Date(),
    }) {
        this.id = id || null;

        this.gincanaId = String(gincanaId);
        this.atividadeId = String(atividadeId);
        this.equipeId = String(equipeId);
        this.equipeAlvoId = String(equipeAlvoId); // NOVO
        this.autorUsuarioId = String(autorUsuarioId);

        this.motivo = String(motivo || "").trim();

        this.evidencias = Array.isArray(evidencias)
            ? evidencias.map((ev) => ({
                id: ev.id,
                tipo: ev.tipo,
                path: ev.path,
                tamanhoBytes: Number(ev.tamanhoBytes || 0),
                createdAt: paraDate(ev.createdAt) || new Date(),
            }))
            : [];

        this.status = status;
        this.parecer = parecer;
        this.analisadoPorUsuarioId = analisadoPorUsuarioId;

        this.impactouPontuacao = Boolean(impactouPontuacao);
        this.ajustePontuacao = ajustePontuacao
            ? {
                bonus: Number(ajustePontuacao.bonus || 0),
                penalidade: Number(ajustePontuacao.penalidade || 0),
                totalAntes: Number(ajustePontuacao.totalAntes || 0),
                totalDepois: Number(ajustePontuacao.totalDepois || 0),
            }
            : null;

        this.criadoEm = paraDate(criadoEm) || new Date();
        this.atualizadoEm = paraDate(atualizadoEm) || new Date();
    }

    static fromFirestore(docOrData, idOpcional = null) {
        if (!docOrData) return null;
        if (docOrData.id && typeof docOrData.data === "function") {
            const data = docOrData.data();
            if (!data) return null;
            return new Revisao({ id: docOrData.id, ...data });
        }
        const data = docOrData;
        return new Revisao({ id: idOpcional || data.id || null, ...data });
    }

    toFirestore() {
        return {
            gincanaId: this.gincanaId,
            atividadeId: this.atividadeId,
            equipeId: this.equipeId,
            equipeAlvoId: this.equipeAlvoId, // NOVO
            autorUsuarioId: this.autorUsuarioId,

            motivo: this.motivo,
            evidencias: this.evidencias.map((ev) => ({
                id: ev.id,
                tipo: ev.tipo,
                path: ev.path,
                tamanhoBytes: Number(ev.tamanhoBytes || 0),
                createdAt: ev.createdAt,
            })),

            status: this.status,
            parecer: this.parecer,
            analisadoPorUsuarioId: this.analisadoPorUsuarioId,

            impactouPontuacao: this.impactouPontuacao,
            ajustePontuacao: this.ajustePontuacao
                ? {
                    bonus: Number(this.ajustePontuacao.bonus || 0),
                    penalidade: Number(this.ajustePontuacao.penalidade || 0),
                    totalAntes: Number(this.ajustePontuacao.totalAntes || 0),
                    totalDepois: Number(this.ajustePontuacao.totalDepois || 0),
                }
                : null,

            criadoEm: this.criadoEm,
            atualizadoEm: this.atualizadoEm,
        };
    }

    toObject() {
        return {
            id: this.id,

            gincanaId: this.gincanaId,
            atividadeId: this.atividadeId,
            equipeId: this.equipeId,
            equipeAlvoId: this.equipeAlvoId, // NOVO
            autorUsuarioId: this.autorUsuarioId,

            motivo: this.motivo,
            evidencias: this.evidencias.map((ev) => ({
                id: ev.id,
                tipo: ev.tipo,
                path: ev.path,
                tamanhoBytes: Number(ev.tamanhoBytes || 0),
                createdAt: ev.createdAt instanceof Date ? ev.createdAt.toISOString() : ev.createdAt,
            })),

            status: this.status,
            parecer: this.parecer,
            analisadoPorUsuarioId: this.analisadoPorUsuarioId,

            impactouPontuacao: this.impactouPontuacao,
            ajustePontuacao: this.ajustePontuacao,

            criadoEm: this.criadoEm ? this.criadoEm.toISOString() : null,
            atualizadoEm: this.atualizadoEm ? this.atualizadoEm.toISOString() : null,
        };
    }

    atualizarTimestamp() {
        this.atualizadoEm = new Date();
    }

    podeAdicionarEvidencia() {
        const permitido = [StatusRevisaoEnum.ABERTA, StatusRevisaoEnum.EM_ANALISE];
        return permitido.includes(this.status) && this.evidencias.length < 3;
    }

    adicionarEvidencia(evidencia) {
        if (!this.podeAdicionarEvidencia()) {
            throw new Error("Não é permitido adicionar evidências neste status ou limite atingido.");
        }
        if (!evidencia || !evidencia.id || !evidencia.path) {
            throw new Error("Evidência inválida.");
        }
        if (!Object.values(TipoEvidenciaEnum).includes(evidencia.tipo)) {
            throw new Error("Tipo de evidência inválido.");
        }
        this.evidencias.push({
            id: evidencia.id,
            tipo: evidencia.tipo,
            path: evidencia.path,
            tamanhoBytes: Number(evidencia.tamanhoBytes || 0),
            createdAt: paraDate(evidencia.createdAt) || new Date(),
        });
        this.atualizarTimestamp();
    }

    marcarEmAnalise(usuarioId) {
        this.status = StatusRevisaoEnum.EM_ANALISE;
        this.analisadoPorUsuarioId = usuarioId || null;
        this.atualizarTimestamp();
    }

    deferir({ parecer, ajustePontuacao, usuarioId }) {
        if (!parecer || !parecer.trim()) {
            throw new Error("Parecer é obrigatório para deferir.");
        }
        if (!ajustePontuacao) {
            throw new Error("Ajuste de pontuação é obrigatório para deferir.");
        }
        this.status = StatusRevisaoEnum.DEFERIDA;
        this.parecer = parecer.trim();
        this.analisadoPorUsuarioId = usuarioId || null;
        this.ajustePontuacao = {
            bonus: Number(ajustePontuacao.bonus || 0),
            penalidade: Number(ajustePontuacao.penalidade || 0),
            totalAntes: Number(ajustePontuacao.totalAntes || 0),
            totalDepois: Number(ajustePontuacao.totalDepois || 0),
        };
        this.impactouPontuacao = true;
        this.atualizarTimestamp();
    }

    indeferir({ parecer, usuarioId }) {
        if (!parecer || !parecer.trim()) {
            throw new Error("Parecer é obrigatório para indeferir.");
        }
        this.status = StatusRevisaoEnum.INDEFERIDA;
        this.parecer = parecer.trim();
        this.analisadoPorUsuarioId = usuarioId || null;
        this.impactouPontuacao = false;
        this.ajustePontuacao = null;
        this.atualizarTimestamp();
    }

    cancelar(usuarioId) {
        this.status = StatusRevisaoEnum.CANCELADA;
        this.parecer = this.parecer || `Cancelada pelo usuário ${usuarioId || ""}`.trim();
        this.atualizarTimestamp();
    }
}

module.exports = Revisao;
