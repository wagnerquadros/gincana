import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { obterGincanaAtiva } from "../api/gincana";
import { listarEquipes } from "../api/equipes";
import "../styles/ModalRanking.css";

export default function ModalRankingGincana({ aberta, onClose }) {
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [gincana, setGincana] = useState(null);
    // [{id, nome, membrosAtivos, total, pontos, bonus, penalidades}]
    const [linhas, setLinhas] = useState([]);

    useEffect(() => {
        if (!aberta) return;
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
                        } catch (e) {
                            console.log(e);
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
                        } catch (e) {
                            console.log(e);
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
            } catch (e) {
                console.log(e);
                setErro("Não foi possível carregar o ranking da gincana.");
                setLinhas([]);
            } finally {
                setCarregando(false);
            }
        })();
    }, [aberta]);

    const ordenadas = useMemo(() => {
        // Ordena por 'total' desc e desempata por nome
        return [...linhas].sort((a, b) => {
            if (b.total !== a.total) return b.total - a.total;
            return a.nome.localeCompare(b.nome);
        });
    }, [linhas]);

    const rowClasse = (idx) =>
        idx === 0 ? "mr-row mr-row-gold" :
            idx === 1 ? "mr-row mr-row-silver" :
                idx === 2 ? "mr-row mr-row-bronze" : "mr-row";

    const medalhaClasse = (idx) =>
        idx === 0 ? "mr-pos gold" :
            idx === 1 ? "mr-pos silver" :
                idx === 2 ? "mr-pos bronze" : "mr-pos";

    if (!aberta) return null;

    const fecharSeClicarFora = (e) => {
        if (e.target.classList.contains("mr-modal-overlay")) onClose?.();
    };

    return (
        <div
            className="mr-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Ranking da gincana"
            onClick={fecharSeClicarFora}
        >
            <div className="mr-modal-card card-elev" onClick={(e) => e.stopPropagation()}>
                {/* Cabeçalho */}
                <header className="mr-modal-head">
                    <div>
                        <h3 className="mr-title">
                            🏆 Ranking — {gincana?.nome || "Gincana ativa"}
                        </h3>
                        <p className="mr-sub">
                            Classificação pelo <strong>Total</strong> (pontos + bônus − penalidades)
                        </p>
                    </div>
                    <button className="mr-btn-close" onClick={onClose} aria-label="Fechar">
                        ✖
                    </button>
                </header>

                {/* Corpo com rolagem vertical */}
                <div className="mr-modal-body">
                    {erro && <div className="mr-alert-erro">{erro}</div>}
                    {carregando ? (
                        <p className="mr-loading">Carregando...</p>
                    ) : ordenadas.length === 0 ? (
                        <div className="mr-vazio">Nenhuma equipe encontrada nesta gincana.</div>
                    ) : (
                        <div className="mr-table-scroll">
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
                                            {/* Pos (centralizado) */}
                                            <td className="center">
                                                <span className={medalhaClasse(idx)} title={`Posição ${idx + 1}`}>
                                                    {idx + 1}
                                                </span>
                                            </td>

                                            {/* Equipe (esquerda) — não mostrar ID */}
                                            <td className="left">
                                                <div className="mr-name">{r.nome}</div>
                                            </td>

                                            {/* Membros/Pontos/Bônus/Penalidades (centro) */}
                                            <td className="center">{r.membrosAtivos}</td>
                                            <td className="center">{r.pontos}</td>
                                            <td className="center">{r.bonus}</td>
                                            <td className="center">{r.penalidades}</td>

                                            {/* Total (direita) */}
                                            <td className="right strong">{r.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Rodapé */}
                <footer className="mr-modal-foot">
                    <button className="btn btn-secondary" onClick={onClose}>Fechar</button>
                </footer>
            </div>
        </div>
    );
}
