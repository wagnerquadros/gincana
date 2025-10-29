import { useEffect, useMemo, useState } from "react";
import "../styles/ModalAtividade.css";
import EditorTexto from "./EditorTexto";

function toISODateAtMidnightTZ(dateStr, tz = "-03:00") {
    if (!dateStr) return "";
    return `${dateStr}T00:00:00${tz}`;
}
function toDateInput(d) {
    if (!d) return "";
    const dt = new Date(d);
    return isNaN(dt) ? "" : dt.toISOString().slice(0, 10);
}
function htmlToPlainText(html = "") {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
}

export default function ModalAtividade({
    visivel,
    onFechar,
    onSalvar,
    gincanaAtiva,
    modo = "criar",            // "criar" | "editar"
    dadosIniciais = null,      // objeto da atividade no modo editar
}) {
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState(""); // HTML
    const [tipo, setTipo] = useState("");
    const [inicio, setInicio] = useState("");
    const [fim, setFim] = useState("");
    const [p1, setP1] = useState(0);
    const [p2, setP2] = useState(0);
    const [p3, setP3] = useState(0);
    const [criterios, setCriterios] = useState(""); // HTML
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    const tipos = useMemo(
        () => [
            "ARRECADACAO",
            "COMPETICAO",
            "QUIZ",
            "SOCIAL",
            "ESPORTIVA",
            "INDIVIDUAL",
            "COLETIVA",
        ],
        []
    );

    useEffect(() => {
        if (!visivel) return;
        if (modo === "editar" && dadosIniciais) {
            setTitulo(dadosIniciais.titulo || "");
            setDescricao(dadosIniciais.descricao || ""); // já pode vir HTML
            setTipo(dadosIniciais.tipo || "");
            setInicio(toDateInput(dadosIniciais.inicio));
            setFim(toDateInput(dadosIniciais.fim));
            setP1(dadosIniciais.pontosPrimeiro ?? 0);
            setP2(dadosIniciais.pontosSegundo ?? 0);
            setP3(dadosIniciais.pontosTerceiro ?? 0);
            setCriterios(
                Array.isArray(dadosIniciais.criterios)
                    ? dadosIniciais.criterios.join(", ")
                    : (dadosIniciais.criterios || "")
            );
        } else {
            // modo criar: tudo zerado
            setTitulo("");
            setDescricao("");
            setTipo("");
            setInicio("");
            setFim("");
            setP1(0);
            setP2(0);
            setP3(0);
            setCriterios("");
        }
        setErro("");
        setSalvando(false);
    }, [visivel, modo, dadosIniciais]);

    if (!visivel) return null;

    async function handleSubmit(e) {
        e.preventDefault();
        setErro("");

        if (!gincanaAtiva?.id) return setErro("Nenhuma gincana ativa selecionada.");
        if (!titulo.trim()) return setErro("Informe o título.");
        // Descrição é HTML — também validamos conteúdo sem tags
        const descPlain = htmlToPlainText(descricao).trim();
        if (!descPlain) return setErro("Informe a descrição.");
        if (!tipo) return setErro("Selecione o tipo da atividade.");
        if (!inicio) return setErro("Informe a data de início.");
        if (!fim) return setErro("Informe a data de término.");

        // Critérios: o input é em HTML, convertemos para texto e split em vírgulas
        const criteriosPlain = htmlToPlainText(criterios);
        const criteriosList = criteriosPlain
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        const payload = {
            gincanaId: gincanaAtiva.id,
            titulo: titulo.trim(),
            descricao, // HTML
            tipo,
            inicio: toISODateAtMidnightTZ(inicio),
            fim: toISODateAtMidnightTZ(fim),
            pontosPrimeiro: Number(p1) || 0,
            pontosSegundo: Number(p2) || 0,
            pontosTerceiro: Number(p3) || 0,
            criterios: criteriosList,
            statusAtividade:
                modo === "editar" ? (dadosIniciais?.statusAtividade || "AGENDADA") : "AGENDADA",
            ativa: true,
        };

        try {
            setSalvando(true);
            await onSalvar?.(payload, dadosIniciais);
            onFechar?.();
        } catch (err) {
            console.error(err);
            setErro("Não foi possível salvar a atividade.");
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className="modal-bg" role="dialog" aria-modal="true" aria-label="Cadastro de atividade">
            <div className="modal-card card-elev">
                <header className="modal-head">
                    <h3 style={{ margin: 0, fontWeight: 600 }}>
                        {modo === "editar" ? "Editar Atividade" : "Nova Atividade"}
                    </h3>
                    <button className="btn btn-secondary" onClick={onFechar}>✖</button>
                </header>

                <form onSubmit={handleSubmit} className="grid-2">
                    <div className="field">
                        <label className="label">Gincana</label>
                        <input className="input" value={gincanaAtiva?.nome || "-"} disabled />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="tipo">Tipo</label>
                        <select
                            id="tipo"
                            className="input"
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                        >
                            <option value="" disabled>Selecione o tipo</option>
                            {tipos.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div className="field" style={{ gridColumn: "1 / -1" }}>
                        <label className="label" htmlFor="titulo">Título</label>
                        <input
                            id="titulo"
                            className="input"
                            placeholder="Ex.: Grito de Guerra"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                        />
                    </div>

                    {/* Descrição (rich text, mais alta) */}
                    <div className="field" style={{ gridColumn: "1 / -1" }}>
                        <label className="label">Descrição</label>
                        <EditorTexto
                            value={descricao}
                            onChange={setDescricao}
                            placeholder="Descreva a atividade (pode usar negrito, listas, links...)"
                            height="180px"
                        />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="inicio">Início</label>
                        <input
                            id="inicio"
                            type="date"
                            className="input"
                            value={inicio}
                            onChange={(e) => setInicio(e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="fim">Fim</label>
                        <input
                            id="fim"
                            type="date"
                            className="input"
                            value={fim}
                            onChange={(e) => setFim(e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="p1">1º lugar (pts)</label>
                        <input id="p1" type="number" className="input" placeholder="ex.: 100" value={p1} onChange={(e) => setP1(e.target.value)} />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="p2">2º lugar (pts)</label>
                        <input id="p2" type="number" className="input" placeholder="ex.: 60" value={p2} onChange={(e) => setP2(e.target.value)} />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="p3">3º lugar (pts)</label>
                        <input id="p3" type="number" className="input" placeholder="ex.: 30" value={p3} onChange={(e) => setP3(e.target.value)} />
                    </div>

                    {/* Critérios (rich text, mais alto; será convertido para lista por vírgulas) */}
                    <div className="field" style={{ gridColumn: "1 / -1" }}>
                        <label className="label">Critérios</label>
                        <EditorTexto
                            value={criterios}
                            onChange={setCriterios}
                            placeholder="ex.: prazo, condições de entrega..."
                            height="140px"
                        />
                    </div>

                    {erro && (
                        <div className="alert-erro" style={{ gridColumn: "1 / -1" }}>
                            {erro}
                        </div>
                    )}

                    <div className="btn-row" style={{ gridColumn: "1 / -1" }}>
                        <button type="submit" className="btn btn-primary" disabled={salvando}>
                            {salvando
                                ? "Salvando..."
                                : modo === "editar"
                                    ? "Salvar alterações"
                                    : "Criar atividade"}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={onFechar}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
