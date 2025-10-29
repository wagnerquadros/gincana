
import { useEffect, useMemo, useState } from "react";
import "../styles/ModalAtividade.css";


function toISODateAtMidnightTZ(dateStr, tz = "-03:00") {
    if (!dateStr) return "";
    return `${dateStr}T00:00:00${tz}`;
}

export default function ModalAtividade({
    visivel,
    onFechar,
    onSalvar,          // (payload) => Promise<void> | void
    gincanaAtiva,      // { id, nome, ... }
    inicial = null,    // dados da atividade para edição (opcional)
    modo = "criar",    // "criar" | "editar"
}) {
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [tipo, setTipo] = useState("QUIZ");
    const [inicio, setInicio] = useState(""); // date input (YYYY-MM-DD)
    const [fim, setFim] = useState("");       // date input (YYYY-MM-DD)
    const [p1, setP1] = useState(100);
    const [p2, setP2] = useState(60);
    const [p3, setP3] = useState(30);
    const [criterios, setCriterios] = useState("tempo, acertos");
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    // Opções de tipo (fixas por enquanto)
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

    // Carrega dados no modo edição
    useEffect(() => {
        if (visivel && inicial) {
            setTitulo(inicial.titulo || "");
            setDescricao(inicial.descricao || "");
            setTipo(inicial.tipo || "QUIZ");
            setInicio(inicial.inicio ? inicial.inicio.slice(0, 10) : "");
            setFim(inicial.fim ? inicial.fim.slice(0, 10) : "");
            setP1(inicial.pontosPrimeiro ?? 100);
            setP2(inicial.pontosSegundo ?? 60);
            setP3(inicial.pontosTerceiro ?? 30);
            setCriterios(Array.isArray(inicial.criterios) ? inicial.criterios.join(", ") : "tempo, acertos");
        }
        if (visivel && !inicial) {
            // reset no modo criar
            setTitulo("");
            setDescricao("");
            setTipo("QUIZ");
            setInicio("");
            setFim("");
            setP1(100);
            setP2(60);
            setP3(30);
            setCriterios("tempo, acertos");
        }
        setErro("");
        setSalvando(false);
    }, [visivel, inicial]);

    if (!visivel) return null;

    async function handleSubmit(e) {
        e.preventDefault();
        setErro("");

        if (!gincanaAtiva?.id) {
            setErro("Nenhuma gincana ativa selecionada.");
            return;
        }
        if (!titulo.trim()) return setErro("Informe o título.");
        if (!descricao.trim()) return setErro("Informe a descrição.");
        if (!inicio) return setErro("Informe a data de início.");
        if (!fim) return setErro("Informe a data de término.");

        const payload = {
            gincanaId: gincanaAtiva.id,
            titulo: titulo.trim(),
            descricao: descricao.trim(),
            tipo,
            inicio: toISODateAtMidnightTZ(inicio),
            fim: toISODateAtMidnightTZ(fim),
            pontosPrimeiro: Number(p1) || 0,
            pontosSegundo: Number(p2) || 0,
            pontosTerceiro: Number(p3) || 0,
            criterios: criterios
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            statusAtividade: "AGENDADA",
            ativa: true,
        };

        try {
            setSalvando(true);
            await onSalvar?.(payload, inicial); // quem chama decide se é criar ou editar
            onFechar?.();
        } catch (e) {
            console.error(e);
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
                        <select id="tipo" className="input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                            {tipos.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div className="field" style={{ gridColumn: "1 / -1" }}>
                        <label className="label" htmlFor="titulo">Título</label>
                        <input id="titulo" className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                    </div>

                    <div className="field" style={{ gridColumn: "1 / -1" }}>
                        <label className="label" htmlFor="descricao">Descrição</label>
                        <textarea id="descricao" className="input" rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="inicio">Início</label>
                        <input id="inicio" type="date" className="input" value={inicio} onChange={(e) => setInicio(e.target.value)} />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="fim">Fim</label>
                        <input id="fim" type="date" className="input" value={fim} onChange={(e) => setFim(e.target.value)} />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="p1">1º lugar (pts)</label>
                        <input id="p1" type="number" className="input" value={p1} onChange={(e) => setP1(e.target.value)} />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="p2">2º lugar (pts)</label>
                        <input id="p2" type="number" className="input" value={p2} onChange={(e) => setP2(e.target.value)} />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="p3">3º lugar (pts)</label>
                        <input id="p3" type="number" className="input" value={p3} onChange={(e) => setP3(e.target.value)} />
                    </div>

                    <div className="field" style={{ gridColumn: "1 / -1" }}>
                        <label className="label" htmlFor="criterios">Critérios (separe por vírgula)</label>
                        <input
                            id="criterios"
                            className="input"
                            placeholder="ex.: tempo, acertos"
                            value={criterios}
                            onChange={(e) => setCriterios(e.target.value)}
                        />
                    </div>

                    {erro && <div className="alert-erro" style={{ gridColumn: "1 / -1" }}>{erro}</div>}

                    <div className="btn-row" style={{ gridColumn: "1 / -1" }}>
                        <button type="submit" className="btn btn-primary" disabled={salvando}>
                            {salvando ? "Salvando..." : (modo === "editar" ? "Salvar alterações" : "Criar atividade")}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={onFechar}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
