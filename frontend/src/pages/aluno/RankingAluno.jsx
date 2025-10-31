import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import { obterGincanaAtiva } from "../../api/gincana";
import { listarEquipes } from "../../api/equipes";
import "../../styles/Dashboard.css";   // tem .metrics, .metric, etc
import "../../styles/Gincana.css";     // paleta/base
import "../../styles/ModalRanking.css"; // estilos do ranking da tabela
import RankingInlineGincana from "../../components/RankingInlineGincana";

/* === helpers === */
function normalizarStatusAtividade(a) {
    const bruto = (
        a.statusAtividade ?? a.status ?? a.situacao ?? a.estado ?? ""
    )
        .toString()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toUpperCase()
        .trim();

    if (bruto.includes("ANDAMENT")) return "EM_ANDAMENTO";
    if (bruto.includes("AGEND")) return "AGENDADA";
    if (bruto.includes("CONCLU")) return "CONCLUIDA";
    return bruto || "DESCONHECIDO";
}



function Kpi({ icone, titulo, valor, bg }) {
    return (
        <div className="card metric" style={{ minWidth: 260 }}> {/* + minWidth */}
            <div className={`metric-icon ${bg}`} aria-hidden="true">
                {icone}
            </div>
            <div>
                <div className="metric-title">{titulo}</div>
                <div className="metric-value">{valor}</div>
            </div>
        </div>
    );
}

function MedalCard({ pos, nome, pontos, membros, cor }) {
    const titulo = `${pos}º Lugar`;
    const badgeClass =
        pos === 1 ? "mr-pos gold" : pos === 2 ? "mr-pos silver" : "mr-pos bronze";

    return (
        <div className="card card-elev" style={{ display: "grid", gap: 8 }}>
            <div className="card-header" style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className={badgeClass}>{pos}</span>
                    <div className="label" style={{ fontWeight: 800 }}>{titulo}</div>
                </div>
            </div>
            <div style={{ padding: "0 16px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12 }}>●</span>
                    <div className="value" style={{ fontWeight: 700, color: cor }}>
                        {nome || "—"}
                    </div>
                </div>
                <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
                    <strong>{pontos ?? 0}</strong> pontos · {membros ?? 0} membros
                </div>
            </div>
        </div>
    );
}

/* barra proporcional da classificação */
function LinhaClassificacao({ pos, nome, total, membros, max }) {
    const pct = max > 0 ? Math.round((total / max) * 100) : 0;
    const medalClass =
        pos === 1 ? "mr-pos gold" : pos === 2 ? "mr-pos silver" : pos === 3 ? "mr-pos bronze" : "mr-pos";

    return (
        <li className="card card-elev" style={{ padding: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "36px 1fr auto", alignItems: "center", gap: 12 }}>
                <span className={medalClass}>{pos}</span>
                <div>
                    <div className="value" style={{ fontWeight: 700 }}>{nome}</div>
                    <div style={{ height: 8, background: "var(--line)", borderRadius: 999, marginTop: 8, overflow: "hidden" }}>
                        <div
                            style={{
                                height: "100%",
                                width: `${pct}%`,
                                background: "linear-gradient(90deg,#f59e0b,#f97316)",
                            }}
                        />
                    </div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div className="value" style={{ fontWeight: 800 }}>{total}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{membros} membros</div>
                </div>
            </div>
        </li>
    );
}

export default function RankingAluno() {
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [gincana, setGincana] = useState(null);
    const [linhas, setLinhas] = useState([]); // {id, nome, membrosAtivos, total, pontos, bonus, penalidades}
    const [qConcluidas, setQConcluidas] = useState(0);

    useEffect(() => {
        let cancelado = false;

        async function carregar() {
            try {
                setErro("");
                setCarregando(true);

                // 1) gincana
                const ativa = await obterGincanaAtiva();
                if (cancelado) return;
                if (!ativa?.id) {
                    setGincana(null);
                    setLinhas([]);
                    setQConcluidas(0);
                    setErro("Nenhuma gincana ativa encontrada.");
                    return;
                }
                setGincana(ativa);

                const gid = ativa.id;

                // 2) equipes da gincana
                const todas = await listarEquipes().catch((err) => {
                    console.error(err);
                    return [];
                });
                const equipesDaGincana = (todas || []).filter(
                    (e) => (e.gincanaId || e?.gincana?.id) === gid
                );

                // 3) linhas (membros + pontuação)
                const rows = await Promise.all(
                    equipesDaGincana.map(async (e) => {
                        const id = e.id;
                        let membrosAtivos = 0;
                        let total = 0;
                        let pontos = 0;
                        let bonus = 0;
                        let penalidades = 0;

                        try {
                            const { data: contagem } = await api.get(`/equipes/${id}/membros/contagem`);
                            membrosAtivos = Number(contagem?.totalAtivos || 0);
                        } catch (err) {
                            console.error(err);
                        }

                        try {
                            const { data: pont } = await api.get(`/equipes/${id}/pontuacao/gincana/${gid}`);
                            total = Number(pont?.total || 0);
                            pontos = Number(pont?.pontos || 0);
                            bonus = Number(pont?.bonus || 0);
                            penalidades = Number(pont?.penalidades || 0);
                        } catch (err) {
                            console.error(err);
                        }

                        return {
                            id,
                            nome: e.nome || "",
                            membrosAtivos,
                            total,
                            pontos,
                            bonus,
                            penalidades,
                        };
                    })
                );

                if (cancelado) return;
                setLinhas(rows);

                // 4) atividades concluídas
                try {
                    const { data: acts } = await api.get(`/atividades/gincana/${gid}`);
                    const concluidas = (Array.isArray(acts) ? acts : [])
                        .map((a) => ({ ...a, _s: normalizarStatusAtividade(a) }))
                        .filter((a) => a._s === "CONCLUIDA");
                    setQConcluidas(concluidas.length);
                } catch (err) {
                    console.error(err);
                    setQConcluidas(0);
                }
            } catch (e) {
                console.error(e);
                setErro("Não foi possível carregar o ranking.");
                setLinhas([]);
                setQConcluidas(0);
            } finally {
                if (!cancelado) setCarregando(false);
            }
        }

        carregar();
        return () => {
            cancelado = true;
        };
    }, []);

    const ordenadas = useMemo(() => {
        return [...linhas].sort((a, b) => {
            if (b.total !== a.total) return b.total - a.total;
            return a.nome.localeCompare(b.nome);
        });
    }, [linhas]);

    const lider = ordenadas[0];
    const segundo = ordenadas[1];
    const terceiro = ordenadas[2];
    const maxTotal = ordenadas.length ? Math.max(...ordenadas.map((r) => r.total)) : 0;
    const media = useMemo(() => {
        if (!ordenadas.length) return 0;
        const soma = ordenadas.reduce((s, r) => s + (r.total || 0), 0);
        return Math.round(soma / ordenadas.length);
    }, [ordenadas]);

    /* ---------- render ---------- */
    if (carregando) {
        return (
            <div className="page-wrap">
                <div className="card">Carregando ranking...</div>
            </div>
        );
    }

    return (
        <div className="page-wrap" style={{ display: "grid", gap: 16 }}>
            {/* Cabeçalho — card azul */}
            <div
                className="card"
                style={{
                    background: "linear-gradient(135deg, var(--blue), #4f46e5)",
                    border: "1px solid #3b82f6",
                    boxShadow: "0 10px 26px rgba(37, 99, 235, 0.18)",
                    color: "#fff",
                }}
            >
                <div className="card-header">
                    <div>
                        <h1 className="h1" style={{ margin: 0, color: "#fff" }}>Ranking Geral</h1>
                        <p
                            className="muted"
                            style={{ marginTop: 6, color: "rgba(255,255,255,0.85)" }}
                        >
                            {gincana?.nome
                                ? `Acompanhe a classificação da ${gincana.nome}`
                                : "Sem gincana ativa"}
                        </p>
                    </div>
                </div>
            </div>

            {/* alerta permanece fora/abaixo para manter contraste */}
            {erro && <div className="alert-erro">{erro}</div>}

            {/* KPIs do topo — centralizados */}
            {/* KPIs do topo — centralizados e coloridos */}
            <section style={{ width: "100%" }}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(260px, 1fr))",
                        gap: 16,
                        maxWidth: 980,
                        margin: "0 auto",
                        alignItems: "stretch",
                    }}
                >
                    <div
                        style={{
                            background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                            border: "1px solid #fbbf24",
                            boxShadow: "0 4px 16px rgba(251,191,36,0.25)",
                            borderRadius: 12,
                        }}
                    >
                        <Kpi
                            icone="🏆"
                            titulo="Equipe Líder"
                            valor={lider?.nome || "—"}
                            bg="bg-gold"
                        />
                    </div>

                    <div
                        style={{
                            background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                            border: "1px solid #60a5fa",
                            boxShadow: "0 4px 16px rgba(59,130,246,0.25)",
                            borderRadius: 12,
                        }}
                    >
                        <Kpi
                            icone="📈"
                            titulo="Pontuação da Líder"
                            valor={`${lider?.total ?? 0} pts`}
                            bg="bg-blue"
                        />
                    </div>

                    <div
                        style={{
                            background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
                            border: "1px solid #4ade80",
                            boxShadow: "0 4px 16px rgba(34,197,94,0.25)",
                            borderRadius: 12,
                        }}
                    >
                        <Kpi
                            icone="✅"
                            titulo="Atividades Concluídas"
                            valor={qConcluidas}
                            bg="bg-green"
                        />
                    </div>
                </div>
            </section>

            {/* Cards Top 3 — coloridos e destacados */}
            <section
                style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(260px, 1fr))",
                    gap: 16,
                    maxWidth: 980,
                    margin: "0 auto",
                    alignItems: "stretch",
                }}
            >
                <div
                    style={{
                        background: "linear-gradient(180deg, #fff7e6, #fef3c7)",
                        border: "2px solid #f59e0b",
                        boxShadow: "0 6px 22px rgba(245,158,11,0.3)",
                        borderRadius: 12,
                        transform: "scale(1.04)",
                        transition: "transform 0.2s ease",
                    }}
                >
                    <MedalCard
                        pos={1}
                        nome={lider?.nome}
                        pontos={lider?.total}
                        membros={lider?.membrosAtivos}
                        cor="#b45309"
                    />
                </div>

                <div
                    style={{
                        background: "linear-gradient(180deg, #f8fafc, #e5e7eb)",
                        border: "2px solid #94a3b8",
                        boxShadow: "0 6px 22px rgba(148,163,184,0.25)",
                        borderRadius: 12,
                        transform: "scale(1.02)",
                        transition: "transform 0.2s ease",
                    }}
                >
                    <MedalCard
                        pos={2}
                        nome={segundo?.nome}
                        pontos={segundo?.total}
                        membros={segundo?.membrosAtivos}
                        cor="#334155"
                    />
                </div>

                <div
                    style={{
                        background: "linear-gradient(180deg, #fefce8, #fcd34d)",
                        border: "2px solid #fbbf24",
                        boxShadow: "0 6px 22px rgba(234,179,8,0.25)",
                        borderRadius: 12,
                        transform: "scale(1.02)",
                        transition: "transform 0.2s ease",
                    }}
                >
                    <MedalCard
                        pos={3}
                        nome={terceiro?.nome}
                        pontos={terceiro?.total}
                        membros={terceiro?.membrosAtivos}
                        cor="#78350f"
                    />
                </div>
            </section>


            {/* Classificação completa (só total) */}
            <section className="card card-elev" style={{ paddingBottom: 16 }}>
                <div className="card-header">
                    <h3 className="gincana-title">Classificação Completa</h3>
                    <div className="muted">Média: <strong>{media}</strong> pts</div>
                </div>
                <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
                    {ordenadas.map((r, idx) => (
                        <LinhaClassificacao
                            key={r.id}
                            pos={idx + 1}
                            nome={r.nome}
                            total={r.total}
                            membros={r.membrosAtivos}
                            max={maxTotal}
                        />
                    ))}
                </ul>
            </section>

            {/* Estatísticas (tabela igual à da Dashboard) */}
            <section className="grid-unica">
                <RankingInlineGincana />
            </section>
        </div>
    );
}
