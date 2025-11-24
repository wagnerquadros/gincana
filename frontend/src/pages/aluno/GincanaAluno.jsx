import { useEffect, useMemo, useState } from "react";
import {
    obterGincanaAtiva,
    listarGincanas,
} from "../../api/gincana";
import { listarEquipes } from "../../api/equipes";
import "../../styles/Gincana.css";
import api from "../../api/client";

export default function GincanaAluno() {
    // ===== Estado geral / abas =====
    const [aba, setAba] = useState("ATIVA"); // "ATIVA" | "ENCERRADAS"

    // ===== Estado gincana ativa =====
    const [ativa, setAtiva] = useState(null);
    const [equipesAtiva, setEquipesAtiva] = useState([]);
    const [carregandoAtiva, setCarregandoAtiva] = useState(true);

    // ===== Estado gincanas encerradas =====
    const [encerradas, setEncerradas] = useState([]);
    const [carregandoEncerradas, setCarregandoEncerradas] = useState(true);

    // ===== Mensagens =====
    const [erro, setErro] = useState("");
    const [ok, setOk] = useState("");

    // ===== Estado atividades da gincana ativa =====
    const [atividadesAtiva, setAtividadesAtiva] = useState([]);
    const [carregandoAtividades, setCarregandoAtividades] = useState(false);

    // ===== Helper de data/hora (para atividades) =====
    function fmtDataHora(v) {
        if (!v) return "-";
        const d = new Date(v);
        if (isNaN(d.getTime())) return String(v);
        return d.toLocaleString("pt-BR", { timeZone: "America/Fortaleza" });
    }

    // ===== Helpers de data =====
    function fmtData(v) {
        if (!v) return "-";
        const d = new Date(v);
        if (isNaN(d.getTime())) return String(v);
        return d.toLocaleDateString("pt-BR", { timeZone: "America/Fortaleza" });
    }

    // ===== Carregamentos =====
    useEffect(() => {
        carregarAbaAtiva();
        carregarAbaEncerradas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function carregarAbaAtiva() {
        setCarregandoAtiva(true);
        setErro("");
        setOk("");
        try {
            const g = await obterGincanaAtiva();
            setAtiva(g || null);

            if (g?.id) {
                const todas = await listarEquipes();
                const daAtiva = (todas || []).filter(
                    (e) => (e.gincanaId || e?.gincana?.id) === g.id
                );
                setEquipesAtiva(
                    daAtiva.map((e) => ({
                        id: e.id,
                        nome: e.nome || "",
                        ativo: !!e.ativo,
                    }))
                );
                await carregarAtividadesAtiva(g.id);
            } else {
                setEquipesAtiva([]);
                setAtividadesAtiva([]);
            }
        } catch (e) {
            console.error(e);
            setErro("Não foi possível carregar a gincana ativa.");
        } finally {
            setCarregandoAtiva(false);
        }
    }

    async function carregarAbaEncerradas() {
        setCarregandoEncerradas(true);
        try {
            const todas = await listarGincanas();
            const encerr = (todas || []).filter(
                (g) => (g.status || "").toUpperCase() === "ENCERRADA"
            );
            encerr.sort((a, b) => new Date(b.dataFim || 0) - new Date(a.dataFim || 0));
            setEncerradas(encerr);
        } catch (e) {
            console.error(e);
            setErro((prev) => prev || "Não foi possível carregar gincanas encerradas.");
        } finally {
            setCarregandoEncerradas(false);
        }
    }

    async function carregarAtividadesAtiva(gincanaId) {
        if (!gincanaId) {
            setAtividadesAtiva([]);
            return;
        }
        setCarregandoAtividades(true);
        try {
            const { data } = await api.get(`/atividades/gincana/${gincanaId}`);
            const lista = Array.isArray(data) ? data : [];
            lista.sort((a, b) => new Date(a.inicio || 0) - new Date(b.inicio || 0));
            setAtividadesAtiva(
                lista.map((a) => ({
                    id: a.id,
                    titulo: a.titulo || "",
                    tipo: a.tipo || "",
                    inicio: a.inicio || null,
                    fim: a.fim || null,
                    statusAtividade: a.statusAtividade || "",
                    ativa: !!a.ativa,
                }))
            );
        } catch (e) {
            console.error(e);
            setAtividadesAtiva([]);
        } finally {
            setCarregandoAtividades(false);
        }
    }

    // ===== Equipes: ordenação por nome =====
    const equipesOrdenadas = useMemo(
        () => [...equipesAtiva].sort((a, b) => a.nome.localeCompare(b.nome)),
        [equipesAtiva]
    );

    // ===== UI =====
    return (
        <main className="page-wrap">
            <header className="gincana-header">
                <div className="gincana-tabs" role="tablist" aria-label="Seções da gincana">
                    <button
                        className={`tab-chip ${aba === "ATIVA" ? "active" : ""}`}
                        onClick={() => setAba("ATIVA")}
                        role="tab"
                        aria-selected={aba === "ATIVA"}
                    >
                        🟢 Ativa
                    </button>
                    <button
                        className={`tab-chip ${aba === "ENCERRADAS" ? "active" : ""}`}
                        onClick={() => setAba("ENCERRADAS")}
                        role="tab"
                        aria-selected={aba === "ENCERRADAS"}
                    >
                        🏁 Encerradas
                    </button>
                </div>
            </header>

            {erro && <div className="alert-erro">{erro}</div>}
            {ok && <div className="alert-ok">{ok}</div>}

            {/* ===== ABA ATIVA ===== */}
            {aba === "ATIVA" && (
                <>
                    {carregandoAtiva ? null : ativa ? (
                        <section className="card card-elev">
                            <header className="card-header">
                                <h2 className="gincana-title" style={{ margin: 0, fontWeight: 600 }}>
                                    {ativa?.nome || "Gincana ativa"}
                                </h2>
                                <span className="status-pill--ativa">ATIVA</span>
                            </header>

                            {/* Somente leitura (sem botões) */}
                            <div className="grid-2">
                                <div className="field-read">
                                    <span className="label">Nome</span>
                                    <div className="value">{ativa.nome ?? "-"}</div>
                                </div>

                                <div className="field-read">
                                    <span className="label">Início</span>
                                    <div className="value">{fmtData(ativa.dataInicio)}</div>
                                </div>

                                <div className="field-read">
                                    <span className="label">Término</span>
                                    <div className="value">{fmtData(ativa.dataFim)}</div>
                                </div>

                                <div className="field-read">
                                    <span className="label">Status</span>
                                    <div className="value">{ativa.status ?? "-"}</div>
                                </div>
                            </div>
                        </section>
                    ) : (
                        // Sem modo de criação para aluno — apenas mensagem
                        <section className="card card-elev">
                            <header className="card-header">
                                <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                                    <span className="ico-title">🚀</span> Gincana
                                </h2>
                            </header>
                            <p className="muted">Nenhuma gincana ativa no momento.</p>
                        </section>
                    )}

                    {/* ===== EQUIPES DA GINCANA ATIVA (sem botões) ===== */}
                    <section className="card card-elev eqs-card">
                        <header className="card-header">
                            <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                                <span className="ico-title">👥</span> Equipes inscritas
                            </h2>
                            <small className="eq-tip">
                                {carregandoAtiva
                                    ? ""
                                    : ativa
                                        ? `${equipesOrdenadas.length} equipe(s)`
                                        : "Crie/ative uma gincana para cadastrar equipes."}
                            </small>
                        </header>

                        {carregandoAtiva ? null : ativa ? (
                            equipesOrdenadas.length ? (
                                <ul className="teams-grid">
                                    {equipesOrdenadas.map((t) => (
                                        <li key={t.id} className="team-card">
                                            <div className="team-top">
                                                <span className="team-emoji" aria-hidden="true">🛡️</span>
                                                <span className={`team-badge ${t.ativo ? "on" : "off"}`}>
                                                    {t.ativo ? "Ativa" : "Inativa"}
                                                </span>
                                            </div>
                                            <div className="team-name">{t.nome}</div>
                                            <div className="team-id">#{t.id.slice(0, 6)}</div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="eq-vazio">Nenhuma equipe cadastrada nesta gincana.</div>
                            )
                        ) : null}
                    </section>

                    {/* ===== ATIVIDADES DA GINCANA ATIVA (sem botões) ===== */}
                    <section className="card card-elev acts-card">
                        <header className="card-header">
                            <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                                <span className="ico-title">📅</span> Atividades da gincana
                            </h2>
                            <small className="eq-tip">
                                {carregandoAtividades
                                    ? ""
                                    : ativa
                                        ? `${atividadesAtiva.length} atividade(s)`
                                        : "Crie/ative uma gincana para cadastrar atividades."}
                            </small>
                        </header>

                        {carregandoAtividades ? null : ativa ? (
                            atividadesAtiva.length ? (
                                <ul className="acts-grid">
                                    {atividadesAtiva.map((a) => (
                                        <li key={a.id} className="act-card">
                                            <div className="act-top">
                                                <span className="act-emoji" aria-hidden="true">🎯</span>
                                                <span className={`act-badge ${a.statusAtividade?.toLowerCase() || ""}`}>
                                                    {a.statusAtividade || "—"}
                                                </span>
                                            </div>
                                            <div className="act-title">{a.titulo}</div>
                                            <div className="act-meta">
                                                <span className="act-tipo">{a.tipo || "—"}</span>
                                                <span className="act-sep">•</span>
                                                <span>{fmtDataHora(a.inicio)} — {fmtDataHora(a.fim)}</span>
                                            </div>
                                            <div className="act-id">#{a.id.slice(0, 6)}</div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="eq-vazio">Nenhuma atividade cadastrada nesta gincana.</div>
                            )
                        ) : null}
                    </section>
                </>
            )}

            {/* ===== ABA ENCERRADAS ===== */}
            {aba === "ENCERRADAS" && (
                <section className="card card-elev">
                    <header className="card-header">
                        <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                            <span className="ico-title">📚</span> Eventos encerrados
                        </h2>
                        {/* sem botão de atualizar/detalhes para aluno */}
                    </header>

                    {carregandoEncerradas ? null : encerradas.length ? (
                        <ul className="ended-grid">
                            {encerradas.map((g) => (
                                <li key={g.id} className="ended-card">
                                    <div className="ended-top">
                                        <span className="ended-emoji" aria-hidden="true">🏁</span>
                                        <span className="status-pill--ended">ENCERRADA</span>
                                    </div>
                                    <div className="ended-name">{g.nome}</div>
                                    <div className="ended-dates">
                                        {fmtData(g.dataInicio)} — {fmtData(g.dataFim)}
                                    </div>
                                    {/* sem botões */}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="eq-vazio">Nenhum evento encerrado encontrado.</div>
                    )}
                </section>
            )}
        </main>
    );
}
