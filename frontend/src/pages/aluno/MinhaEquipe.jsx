import { useEffect, useMemo, useState } from "react";
import { useAutenticacao } from "../../auth/useAutenticacao";
import { obterUsuario } from "../../api/usuarios";
import { obterEquipe, listarMembrosEquipe, obterPontuacaoEquipeGincana } from "../../api/equipes";
import { obterGincanaAtiva } from "../../api/gincana";
import api from "../../api/client";
import ModalEntrarEquipe from "../../components/ModalEntrarEquipe";
import "../../styles/MinhaEquipe.css";

function normalizarStatus(s) {
    const v = String(s || "").toUpperCase().trim();
    if (v.includes("ANALIS")) return "EM_ANALISE";
    if (v.includes("ABERT")) return "ABERTA";
    if (v.includes("INDEFERID")) return "INDEFERIDA";
    if (v.includes("DEFERID")) return "DEFERIDA";
    if (v.includes("CANCELAD")) return "CANCELADA";
    return v || "DESCONHECIDO";
}

function formatarData(iso) {
    try { const d = new Date(iso); return d.toLocaleString(); } catch { return String(iso || "-"); }
}

/**
 * Página que exibe informações da equipe atual do aluno
 * Permite visualizar dados da equipe, membros, pontuação e trocar de equipe
 */
export default function MinhaEquipe() {
    const { usuario, atualizarUsuario } = useAutenticacao();
    
    // Estados
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [equipe, setEquipe] = useState(null);
    const [membros, setMembros] = useState([]);
    const [pontuacao, setPontuacao] = useState({ total: 0, pontos: 0, bonus: 0, penalidades: 0 });
    const [gincana, setGincana] = useState(null);
    const [revisoes, setRevisoes] = useState([]);
    const [revErro, setRevErro] = useState("");
    const [revCarregando, setRevCarregando] = useState(false);
    const [modalRevAberto, setModalRevAberto] = useState(false);
    const [revSelecionada, setRevSelecionada] = useState(null);
    
    // Modal de troca de equipe
    const [modalTrocarEquipeAberto, setModalTrocarEquipeAberto] = useState(false);

    // Carrega dados da equipe do aluno
    useEffect(() => {
        async function carregarDadosEquipe() {
            if (!usuario?.id) {
                setCarregando(false);
                return;
            }

            try {
                setErro("");
                setCarregando(true);

                // 1. Busca dados completos do usuário para obter equipeId
                const usuarioCompleto = await obterUsuario(usuario.id);
                const equipeId = usuarioCompleto?.equipeId;

                if (!equipeId) {
                    // Aluno não tem equipe
                    setEquipe(null);
                    setMembros([]);
                    setPontuacao({ total: 0, pontos: 0, bonus: 0, penalidades: 0 });
                    setCarregando(false);
                    return;
                }

                // 2. Busca dados da equipe
                const dadosEquipe = await obterEquipe(equipeId);
                setEquipe(dadosEquipe);

                // 3. Busca gincana ativa (para pontuação)
                const gincanaAtiva = await obterGincanaAtiva();
                setGincana(gincanaAtiva);

                // 4. Busca membros da equipe (apenas ativos)
                const membrosAtivos = await listarMembrosEquipe(equipeId, { ativo: true });
                setMembros(membrosAtivos);

                // 5. Busca pontuação da equipe na gincana ativa (se houver)
                if (gincanaAtiva?.id) {
                    const pontuacaoData = await obterPontuacaoEquipeGincana(equipeId, gincanaAtiva.id);
                    setPontuacao({
                        total: pontuacaoData?.total || 0,
                        pontos: pontuacaoData?.pontos || 0,
                        bonus: pontuacaoData?.bonus || 0,
                        penalidades: pontuacaoData?.penalidades || 0,
                    });

                    try {
                        setRevErro("");
                        setRevCarregando(true);
                        const { data } = await api.get(`/revisoes?gincanaId=${gincanaAtiva.id}`);
                        const arr = Array.isArray(data) ? data : [];
                        const norm = arr.map((r) => ({ ...r, _status: normalizarStatus(r.status) }))
                          .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
                        setRevisoes(norm);
                    } catch (e) {
                        console.error(e);
                        setRevErro("Não foi possível carregar revisões da equipe.");
                        setRevisoes([]);
                    } finally {
                        setRevCarregando(false);
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar dados da equipe:", error);
                setErro("Não foi possível carregar os dados da sua equipe. Tente novamente.");
            } finally {
                setCarregando(false);
            }
        }

        carregarDadosEquipe();
    }, [usuario?.id]);

    // Handler para quando o aluno trocar de equipe
    const handleTrocaConfirmada = (usuarioAtualizado) => {
        // Atualiza o contexto de autenticação
        if (atualizarUsuario) {
            atualizarUsuario(usuarioAtualizado);
        }
        
        // Fecha o modal
        setModalTrocarEquipeAberto(false);
        
        // Recarrega a página para atualizar os dados
        window.location.reload();
    };

    

    const abertas = useMemo(() => revisoes.filter((r) => r._status === "ABERTA"), [revisoes]);

    // Renderização
    if (carregando) {
        return (
            <div className="minha-equipe-container">
                <div className="card">
                    <div className="card-body">
                        <p>Carregando dados da sua equipe...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Aluno não tem equipe
    if (!equipe) {
        return (
            <div className="minha-equipe-container">
                <div className="card">
                    <div className="card-head">Minha Equipe</div>
                    <div className="card-body">
                        <div className="me-sem-equipe">
                            <p className="me-mensagem">Você não está em nenhuma equipe no momento.</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => setModalTrocarEquipeAberto(true)}
                            >
                                Entrar em uma Equipe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal para entrar em equipe */}
                <ModalEntrarEquipe
                    aberta={modalTrocarEquipeAberto}
                    onClose={() => setModalTrocarEquipeAberto(false)}
                    onEntradaConfirmada={handleTrocaConfirmada}
                />
            </div>
        );
    }

    return (
        <>
                {/* Modal para trocar de equipe - passa equipeIdAtual para ocultar a equipe atual da lista */}
            <ModalEntrarEquipe
                aberta={modalTrocarEquipeAberto}
                onClose={() => setModalTrocarEquipeAberto(false)}
                onEntradaConfirmada={handleTrocaConfirmada}
                equipeIdAtual={equipe?.id || null}
            />

            <div className="minha-equipe-container">
                {/* Cabeçalho com nome da equipe e botão de trocar */}
                <div className="card">
                    <div className="card-head me-header-equipe">
                        <div>
                            <h2 className="me-titulo-equipe">👥 {equipe.nome}</h2>
                            {gincana && (
                                <p className="me-subtitulo">Gincana: {gincana.nome}</p>
                            )}
                        </div>
                        <button
                            className="btn btn-secondary me-btn-trocar"
                            onClick={() => setModalTrocarEquipeAberto(true)}
                        >
                            🔄 Trocar de Equipe
                        </button>
                    </div>
                </div>

                {erro && (
                    <div className="alert-erro">{erro}</div>
                )}

                {/* Pontuação da equipe */}
                {gincana && (
                    <div className="card">
                        <div className="card-head">🏆 Pontuação</div>
                        <div className="card-body">
                            <div className="me-pontuacao-grid">
                                <div className="me-pontuacao-item">
                                    <div className="me-pontuacao-label">Pontos</div>
                                    <div className="me-pontuacao-valor me-pontos">{pontuacao.pontos}</div>
                                </div>
                                <div className="me-pontuacao-item">
                                    <div className="me-pontuacao-label">Bônus</div>
                                    <div className="me-pontuacao-valor me-bonus">+{pontuacao.bonus}</div>
                                </div>
                                <div className="me-pontuacao-item">
                                    <div className="me-pontuacao-label">Penalidades</div>
                                    <div className="me-pontuacao-valor me-penalidades">-{pontuacao.penalidades}</div>
                                </div>
                                <div className="me-pontuacao-item me-total">
                                    <div className="me-pontuacao-label">Total</div>
                                    <div className="me-pontuacao-valor me-total-valor">{pontuacao.total}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Membros da equipe */}
                <div className="card">
                    <div className="card-head">
                        👥 Membros da Equipe ({membros.length} {membros.length === 1 ? "membro" : "membros"})
                    </div>
                    <div className="card-body">
                        {membros.length === 0 ? (
                            <p className="me-vazio">Nenhum membro ativo nesta equipe.</p>
                        ) : (
                            <div className="me-membros-lista">
                                {membros.map((membro) => (
                                    <div key={membro.id} className="me-membro-item">
                                        <div className="me-membro-avatar">
                                            {membro.foto ? (
                                                <img src={membro.foto} alt={membro.nome} />
                                            ) : (
                                                <div className="me-avatar-placeholder">
                                                    {membro.nome?.charAt(0)?.toUpperCase() || "?"}
                                                </div>
                                            )}
                                        </div>
                                        <div className="me-membro-info">
                                            <div className="me-membro-nome">
                                                {membro.nome}
                                                {membro.id === usuario?.id && (
                                                    <span className="me-badge-eu">Você</span>
                                                )}
                                            </div>
                                            <div className="me-membro-email">{membro.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Revisões da equipe */}
                <div className="card">
                    <div className="card-head">
                        🔎 Revisões da equipe
                    </div>
                    <div className="card-body">
                        {revCarregando ? (
                            <div>Carregando revisões...</div>
                        ) : revErro ? (
                            <div className="alert-erro">{revErro}</div>
                        ) : revisoes.length === 0 ? (
                            <div className="me-vazio">Nenhuma revisão cadastrada pela equipe.</div>
                        ) : (
                            <ul className="items">
                                {revisoes.map((r) => (
                                    <li
                                        key={r.id}
                                        className="item"
                                        onClick={() => { setRevSelecionada(r); setModalRevAberto(true); }}
                                        role="button"
                                        tabIndex={0}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div>
                                            <div className="item-title">{r.motivo || "Sem motivo"}</div>
                                            <div className="item-sub">#{r.id}</div>
                                        </div>
                                        <div className="item-meta">
                                            <span className="tab-chip">{r._status}</span>
                                            <span style={{ marginLeft: 8 }}>{formatarData(r.criadoEm)}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {modalRevAberto && revSelecionada?.id ? (
                <ModalDetalheRevisaoAluno
                    id={revSelecionada.id}
                    onClose={() => setModalRevAberto(false)}
                />
            ) : null}
        </>
    );
}

function ModalDetalheRevisaoAluno({ id, onClose }) {
    const [detalhe, setDetalhe] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [equipeAutor, setEquipeAutor] = useState("");
    const [equipeAlvo, setEquipeAlvo] = useState("");
    const [atividadeId, setAtividadeId] = useState("");
    const [atividadeTitulo, setAtividadeTitulo] = useState("");

    useEffect(() => {
        let cancelado = false;
        async function carregar() {
            try {
                setErro("");
                setCarregando(true);
                const { data } = await api.get(`/revisoes/${id}`);
                if (cancelado) return;
                setDetalhe(data || null);

                const equipeId = String(data?.equipeId || "").trim();
                const alvoIdRaw = data?.equipeAlvoId;
                const alvoId = (alvoIdRaw && String(alvoIdRaw).trim() !== "undefined") ? String(alvoIdRaw).trim() : null;
                const atvId = String(data?.atividadeId || data?.atividade?.id || "").trim();

                try {
                    if (equipeId) {
                        const eq = await obterEquipe(equipeId);
                        setEquipeAutor(eq?.nome || equipeId);
                    }
                } catch { setEquipeAutor(equipeId); }

                try {
                    if (alvoId) {
                        const eqA = await obterEquipe(alvoId);
                        setEquipeAlvo(eqA?.nome || alvoId);
                    } else {
                        setEquipeAlvo("");
                    }
                } catch { setEquipeAlvo(alvoId || ""); }

                try {
                    if (atvId) {
                        setAtividadeId(atvId);
                        const rAtv = await api.get(`/atividades/${atvId}`);
                        const atv = rAtv?.data;
                        setAtividadeTitulo(atv?.titulo || atvId);
                    } else {
                        setAtividadeId("");
                        setAtividadeTitulo("");
                    }
                } catch { setAtividadeId(atvId || ""); setAtividadeTitulo(atvId || ""); }
            } catch (e) {
                console.log(e);
                setErro("Não foi possível carregar a revisão.");
            } finally {
                if (!cancelado) setCarregando(false);
            }
        }
        carregar();
        return () => { cancelado = true; };
    }, [id]);

    const status = normalizarStatus(detalhe?.status);
    const concluida = status === "DEFERIDA" || status === "INDEFERIDA" || status === "CANCELADA";

    return (
        <div className="modal-backdrop" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
            <div className="modal card card-elev" role="dialog" aria-modal="true" style={{ width: "min(720px, 92vw)", maxHeight: "85vh", overflow: "auto" }}>
                <header className="card-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 style={{ margin: 0 }}>Detalhes da Revisão</h3>
                    <button className="btn btn-secondary" onClick={onClose}>Fechar</button>
                </header>
                <div className="card-body" style={{ display: "grid", gap: 12 }}>
                    {carregando ? (
                        <div>Carregando...</div>
                    ) : erro ? (
                        <div className="alert-erro">{erro}</div>
                    ) : (
                        <>
                            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                <span className="tab-chip">{status}</span>
                                <span className="muted">Criado em {formatarData(detalhe?.criadoEm)}</span>
                            </div>

                            <div style={{ display: "grid", gap: 8 }}>
                                <div><strong>Equipe do autor</strong>: {equipeAutor || "-"}</div>
                                <div><strong>Equipe alvo</strong>: {equipeAlvo || "-"}</div>
                            </div>

                            <div>
                                <div className="section-title">Motivo</div>
                                <div>{detalhe?.motivo || "-"}</div>
                            </div>

                            <div>
                                <div className="section-title">Atividade</div>
                                <div>{atividadeTitulo || atividadeId || "-"}</div>
                            </div>

                            <div>
                                <div className="section-title">Parecer</div>
                                <div>{concluida ? (detalhe?.parecer || "-") : "Em análise / aberto"}</div>
                            </div>

                            <div>
                                <div className="section-title">Evidências</div>
                                <div>{Array.isArray(detalhe?.evidencias) ? `${detalhe.evidencias.length} anexos` : "-"}</div>
                            </div>

                            {detalhe?.ajustePontuacao && (
                                <div>
                                    <div className="section-title">Ajuste de pontuação</div>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                                        <div><strong>Bônus</strong>: {Number(detalhe.ajustePontuacao.bonus || 0)}</div>
                                        <div><strong>Penalidade</strong>: {Number(detalhe.ajustePontuacao.penalidade || 0)}</div>
                                        <div><strong>Total antes</strong>: {Number(detalhe.ajustePontuacao.totalAntes || 0)}</div>
                                        <div><strong>Total depois</strong>: {Number(detalhe.ajustePontuacao.totalDepois || 0)}</div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}