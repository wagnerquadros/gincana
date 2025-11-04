import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { obterGincanaAtiva } from "../api/gincana";
import { listarEquipes } from "../api/equipes";
import "../styles/ModalRanking.css";

export default function RankingInlineGincana() {
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [gincana, setGincana] = useState(null);
    const [linhas, setLinhas] = useState([]);
    const [isMobile, setIsMobile] = useState(false);

    // Detectar tamanho da tela de forma mais precisa
    useEffect(() => {
        const checkMobile = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        (async () => {
            setErro("");
            setCarregando(true);
            try {
                const ativa = await obterGincanaAtiva();
                if (!ativa?.id) {
                    setGincana(null);
                    setLinhas([]);
                    setErro("Nenhuma gincana ativa encontrada.");
                    return;
                }
                setGincana(ativa);

                const todas = await listarEquipes();
                const equipesDaGincana = (todas || []).filter(
                    (e) => (e.gincanaId || e?.gincana?.id) === ativa.id
                );

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

    // Versão mobile melhorada
    const MobileView = () => (
        <div className="mobile-ranking">
            {ordenadas.map((r, idx) => (
                <div key={r.id} className={`mobile-row ${rowClasse(idx)}`}>
                    <div className="mobile-row-header">
                        <span className={medalhaClasse(idx)}>{idx + 1}</span>
                        <div className="mobile-team-info">
                            <span className="mobile-team-name">{r.nome}</span>
                            <span className="mobile-members">👥 {r.membrosAtivos} membros</span>
                        </div>
                        <span className="mobile-total">{r.total}</span>
                    </div>
                    <div className="mobile-row-details">
                        <div className="mobile-stats-grid">
                            <div className="stat-item">
                                <span className="stat-label">Pontos</span>
                                <span className="stat-value">{r.pontos}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Bônus</span>
                                <span className="stat-value bonus">{r.bonus}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Penal.</span>
                                <span className="stat-value penalty">{r.penalidades}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    // Versão desktop com container responsivo
    const DesktopView = () => (
        <div className="table-container">
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
        </div>
    );

    return (
        <div className="ranking-container">
            <div className="card">
                <div className="card-head ranking-titulo">
                    <span className="emoji">🏆</span>
                    <span className="ranking-nome">
                        Ranking — {gincana?.nome || "Gincana ativa"}
                    </span>
                </div>

                <div className="card-body">
                    {erro && <div className="mr-alert-erro">{erro}</div>}

                    {carregando ? (
                        <p className="mr-loading">Carregando...</p>
                    ) : ordenadas.length === 0 ? (
                        <div className="mr-vazio">
                            Nenhuma equipe encontrada nesta gincana.
                        </div>
                    ) : isMobile ? (
                        <MobileView />
                    ) : (
                        <DesktopView />
                    )}
                </div>
            </div>
        </div>
    );
}