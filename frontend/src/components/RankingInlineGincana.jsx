import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { obterGincanaAtiva } from "../api/gincana";
import { listarEquipes } from "../api/equipes";
import "../styles/ModalRanking.css"; // reaproveita TODO o estilo do modal

export default function RankingInlineGincana() {
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [gincana, setGincana] = useState(null);
    // [{id, nome, membrosAtivos, total, pontos, bonus, penalidades}]
    const [linhas, setLinhas] = useState([]);

    useEffect(() => {
        (async () => {
            setErro("");
            setCarregando(true);
            try {
                // 1) Gincana ativa
                const ativa = await obterGincanaAtiva();
                if (!ativa?.id) {
                    setGincana(null);
                    setLinhas([]);
                    setErro("Nenhuma gincana ativa encontrada.");
                    return;
                }
                setGincana(ativa);

                // 2) Equipes da gincana
                const todas = await listarEquipes();
                const equipesDaGincana = (todas || []).filter(
                    (e) => (e.gincanaId || e?.gincana?.id) === ativa.id
                );

                // 3) Para cada equipe, buscar membros ativos e pontuação total
                const rows = await Promise.all(
                    equipesDaGincana.map(async (e) => {
                        const id = e.id;
                        let membrosAtivos = 0;
                        let total = 0;
                        let pontos = 0;
                        let bonus = 0;
                        let penalidades = 0;

                        try {
                            const { data: contagem } = await api.get(
                                `/equipes/${id}/membros/contagem`
                            );
                            membrosAtivos = Number(contagem?.totalAtivos || 0);
                        } catch (err) {
                            console.log(err);
                            setErro((prev) => prev || "Falha ao buscar contagem de membros.");
                        }

                        try {
                            const { data: pont } = await api.get(
                                `/equipes/${id}/pontuacao/gincana/${ativa.id}`
                            );
                            total = Number(pont?.total || 0);
                            pontos = Number(pont?.pontos || 0);
                            bonus = Number(pont?.bonus || 0);
                            penalidades = Number(pont?.penalidades || 0);
                        } catch (err) {
                            console.log(err);
                            setErro((prev) => prev || "Falha ao buscar pontuações.");
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

                setLinhas(rows);
            } catch (err) {
                console.log(err);
                setErro("Não foi possível carregar o ranking da gincana.");
                setLinhas([]);
            } finally {
                setCarregando(false);
            }
        })();
    }, []);

    const ordenadas = useMemo(() => {
        // Ordena por 'total' desc e desempata por nome
        return [...linhas].sort((a, b) => {
            if (b.total !== a.total) return b.total - a.total;
            return a.nome.localeCompare(b.nome);
        });
    }, [linhas]);

    const rowClasse = (idx) =>
        idx === 0 ? "mr-row mr-row-gold"
            : idx === 1 ? "mr-row mr-row-silver"
                : idx === 2 ? "mr-row mr-row-bronze"
                    : "mr-row";

    const medalhaClasse = (idx) =>
        idx === 0 ? "mr-pos gold"
            : idx === 1 ? "mr-pos silver"
                : idx === 2 ? "mr-pos bronze"
                    : "mr-pos";

    // === Render inline (sem overlay), dentro de um card ===
    return (
        <div className="card">
            <div className="card-head ranking-titulo">
                <span className="emoji">🏆</span>
                <span className="ranking-nome">
                    Ranking — {gincana?.nome || "Gincana ativa"}
                </span>
            </div>

            <div className="card-body" style={{ padding: 0 }}>
                {erro && <div className="mr-alert-erro" style={{ margin: 16 }}>{erro}</div>}

                {carregando ? (
                    <p className="mr-loading" style={{ margin: 16 }}>Carregando...</p>
                ) : ordenadas.length === 0 ? (
                    <div className="mr-vazio" style={{ margin: 16 }}>
                        Nenhuma equipe encontrada nesta gincana.
                    </div>
                ) : (
                    <div className="mr-table-scroll" style={{ maxHeight: "none" }}>
                        <table className="mr-table">
                            <thead>
                                <tr>
                                    <th className="center">Pos</th>
                                    <th className="left">Equipe</th>
                                    <th className="center">Membros</th>
                                    <th className="center">Pontos</th>
                                    <th className="center">Bônus</th>
                                    <th className="center">Penalidades</th>
                                    <th className="right strong">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ordenadas.map((r, idx) => (
                                    <tr key={r.id} className={rowClasse(idx)}>
                                        <td className="center">
                                            <span className={medalhaClasse(idx)} title={`Posição ${idx + 1}`}>
                                                {idx + 1}
                                            </span>
                                        </td>
                                        <td className="left">
                                            <div className="mr-name">{r.nome}</div>
                                        </td>
                                        <td className="center">{r.membrosAtivos}</td>
                                        <td className="center">{r.pontos}</td>
                                        <td className="center">{r.bonus}</td>
                                        <td className="center">{r.penalidades}</td>
                                        <td className="right strong">{r.total}</td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                )}
            </div>
            <div style={{ height: 24 }}></div>
        </div>

    );
}
