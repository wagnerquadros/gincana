// src/components/ModalSolicitarRevisao.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { listarEquipesPorGincana } from "../api/equipes";

/**
 * ModalSolicitarRevisao
 *
 * Props:
 * - aberta: boolean
 * - onClose: fn()
 * - gincanaId: string
 * - atividade: { id, titulo }
 * - equipeId: string                      // equipe do autor (aluno)
 * - equipeAlvoIdDefault?: string          // default = equipeId
 * - onEnviado?: fn()                      // callback após sucesso
 * - showEquipeAlvoSelect?: boolean        // default: true (permite escolher um alvo)
 */
export default function ModalSolicitarRevisao({
    aberta,
    onClose,
    gincanaId,
    atividade,
    equipeId,
    equipeAlvoIdDefault,
    onEnviado,
    showEquipeAlvoSelect = true,
}) {
    const [motivo, setMotivo] = useState("");
    const [arquivos, setArquivos] = useState([]);
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);

    // Equipes para select (opcional)
    const [equipes, setEquipes] = useState([]);
    const [carregandoEquipes, setCarregandoEquipes] = useState(false);

    const LIMITE_QTD = 3;
    const LIMITE_MB_POR_ARQ = 5;
    const LIMITE_MB_TOTAL = 10;
    const TIPOS_PERMITIDOS = ["image/", "video/", "application/pdf"];

    const equipeAlvoIdInicial = useMemo(
        () => (equipeAlvoIdDefault || equipeId || ""),
        [equipeAlvoIdDefault, equipeId]
    );
    const [equipeAlvoId, setEquipeAlvoId] = useState(equipeAlvoIdInicial);

    // sempre que mudar default, sincroniza o select
    useEffect(() => {
        setEquipeAlvoId(equipeAlvoIdInicial);
    }, [equipeAlvoIdInicial]);

    // Carrega lista de equipes (para o select) quando abrir
    useEffect(() => {
        if (!aberta || !showEquipeAlvoSelect || !gincanaId) return;
        (async () => {
            try {
                setCarregandoEquipes(true);
                setErro("");
                const lista = await listarEquipesPorGincana(gincanaId, { ativo: true });
                setEquipes(Array.isArray(lista) ? lista : []);
            } catch (e) {
                console.error(e);
                setEquipes([]);
            } finally {
                setCarregandoEquipes(false);
            }
        })();
    }, [aberta, showEquipeAlvoSelect, gincanaId]);

    if (!aberta) return null;

    function validarArquivos(filesList) {
        const files = Array.from(filesList || []);
        if (files.length > LIMITE_QTD) return `Máximo de ${LIMITE_QTD} arquivos.`;
        let total = 0;
        for (const f of files) {
            const okTipo =
                TIPOS_PERMITIDOS.some((t) =>
                    t.endsWith("/") ? f.type.startsWith(t) : f.type === t
                ) || TIPOS_PERMITIDOS.some((t) => f.type.startsWith(t));
            if (!okTipo) return "Tipos permitidos: imagens, vídeos ou PDF.";
            const mb = f.size / (1024 * 1024);
            if (mb > LIMITE_MB_POR_ARQ) return `Cada arquivo deve ter até ${LIMITE_MB_POR_ARQ} MB.`;
            total += mb;
        }
        if (total > LIMITE_MB_TOTAL) return `Tamanho total excede ${LIMITE_MB_TOTAL} MB.`;
        return "";
    }

    function onChangeFiles(e) {
        setErro("");
        const err = validarArquivos(e.target.files);
        if (err) {
            setErro(err);
            e.target.value = "";
            setArquivos([]);
            return;
        }
        setArquivos(Array.from(e.target.files || []));
    }

    async function enviar() {
        setErro("");

        // Validações finais (já chega aqui com equipeId vindo da tela)
        if (!gincanaId || !atividade?.id || !equipeId) {
            setErro("Dados insuficientes (gincana, atividade ou equipe do autor ausentes).");
            return;
        }
        if (!motivo || motivo.trim().length < 10) {
            setErro("Descreva o motivo (mínimo 10 caracteres).");
            return;
        }

        try {
            setSalvando(true);

            const fd = new FormData();
            fd.append("gincanaId", String(gincanaId));
            fd.append("atividadeId", String(atividade.id));
            fd.append("equipeId", String(equipeId));
            if (equipeAlvoId) fd.append("equipeAlvoId", String(equipeAlvoId));
            fd.append("motivo", motivo.trim());
            arquivos.forEach((f, i) => fd.append("arquivos", f, f.name || `arquivo-${i}`));

            const resp = await api.post(`/revisoes`, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (resp.status >= 200 && resp.status < 300) {
                onEnviado?.();
                onClose?.();
            } else {
                setErro("Não foi possível enviar a solicitação. Tente novamente.");
            }
        } catch (e) {
            console.error(e);
            setErro(e?.response?.data?.error || "Falha ao enviar solicitação de revisão.");
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div
            className="modal-backdrop"
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: 16,
            }}
        >
            {/* Centralizado, mesmo “look & feel” dos teus modais */}
            <div
                className="modal card card-elev"
                role="dialog"
                aria-modal="true"
                aria-labelledby="revisao-titulo"
                style={{
                    width: "min(720px, 92vw)",
                    maxHeight: "85vh",
                    overflow: "auto",
                }}
            >
                <header className="card-header">
                    <h3 id="revisao-titulo" style={{ margin: 0 }}>
                        Solicitar Revisão — {atividade?.titulo || "-"}
                    </h3>
                </header>

                <div className="card-body" style={{ display: "grid", gap: 12 }}>
                    {/* AVISO se faltar equipeId (defesa extra) */}
                    {!equipeId && (
                        <div className="alert-erro">
                            Não foi possível identificar sua equipe. Feche este modal e tente novamente.
                        </div>
                    )}

                    {erro && <div className="alert-erro">{erro}</div>}

                    {showEquipeAlvoSelect && (
                        <div className="atividade-campo">
                            <label className="campo-label" htmlFor="equipe-alvo">
                                Equipe alvo (quem deve receber o ajuste)
                            </label>
                            {carregandoEquipes ? (
                                <p className="muted">Carregando equipes...</p>
                            ) : (
                                <select
                                    id="equipe-alvo"
                                    className="input"
                                    value={equipeAlvoId || ""}
                                    onChange={(e) => setEquipeAlvoId(e.target.value)}
                                >
                                    <option value={equipeId || ""}>Minha equipe (padrão)</option>
                                    {equipes
                                        .filter((eq) => String(eq.id) !== String(equipeId))
                                        .map((eq) => (
                                            <option key={eq.id} value={eq.id}>
                                                {eq.nome || eq.id}
                                            </option>
                                        ))}
                                </select>
                            )}
                            <small className="muted">
                                Dica: selecione outra equipe se a revisão for por quebra de regras de um adversário.
                            </small>
                        </div>
                    )}

                    <label className="campo-label" htmlFor="motivo">
                        Descreva o motivo
                    </label>
                    <textarea
                        id="motivo"
                        className="input"
                        rows={4}
                        placeholder="Explique por que você discorda do resultado, cite regras/itens do edital, etc."
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                    />

                    <label className="campo-label" htmlFor="anexos">
                        Evidências (opcional)
                    </label>
                    <input
                        id="anexos"
                        type="file"
                        accept="image/*,video/*,application/pdf"
                        multiple
                        onChange={onChangeFiles}
                    />
                    <small className="muted">
                        Até {LIMITE_QTD} arquivos • Máx {LIMITE_MB_POR_ARQ} MB por arquivo • {LIMITE_MB_TOTAL} MB no total • Tipos: imagem, vídeo ou PDF
                    </small>
                </div>

                <footer className="card-footer btn-row" style={{ justifyContent: "flex-end" }}>
                    <button className="btn btn-secondary" onClick={onClose} disabled={salvando}>
                        Cancelar
                    </button>
                    <button className="btn btn-success" onClick={enviar} disabled={salvando || !equipeId}>
                        {salvando ? "Enviando..." : "Enviar solicitação"}
                    </button>
                </footer>
            </div>
        </div>
    );
}
