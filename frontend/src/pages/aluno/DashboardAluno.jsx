import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import { obterGincanaAtiva } from "../../api/gincana";
import { listarEquipesPorGincana } from "../../api/equipes";
import { useAutenticacao } from "../../auth/useAutenticacao";
import { obterUsuario } from "../../api/usuarios";
import "../../styles/Dashboard.css";
import RankingInlineGincana from "../../components/RankingInlineGincana";
import ModalEntrarEquipe from "../../components/ModalEntrarEquipe";

// === helper local para classificar status ===
function normalizarStatusAtividade(a) {
    const bruto = (
        a.statusAtividade ??
        a.status ??
        a.situacao ??
        a.estado ??
        ""
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
        <div className="card metric">
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

function ListaSimples({ titulo, itens = [], vazio = "Sem itens", destaque }) {
    const cardProps = {
        className: `card list ${destaque ? destaque : ""}`,
        ...(destaque ? { destaque } : {}),
    };

    return (
        <div {...cardProps}>
            <div className="card-head">{titulo}</div>
            <div className="card-body">
                {itens.length === 0 ? (
                    <div className="estado-vazio">{vazio}</div>
                ) : (
                    <ul className="items">
                        {itens.map((a) => (
                            <li className="item" key={a.id}>
                                <div>
                                    <div className="item-title">{a.nome}</div>
                                    <div className="item-sub">{a.tipo}</div>
                                </div>
                                {a.meta ? <div className="item-meta">{a.meta}</div> : null}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default function DashboardAluno() {
    const { usuario, atualizarUsuario } = useAutenticacao();
    
    // gincana
    const [gincana, setGincana] = useState(null);

    // KPIs
    const [qEquipes, setQEquipes] = useState(0);
    const [qAndamento, setQAndamento] = useState(0);
    const [qAgendadas, setQAgendadas] = useState(0);
    const [qConcluidas, setQConcluidas] = useState(0);

    // listas
    const [andamentoLista, setAndamentoLista] = useState([]);
    const [agendadasLista, setAgendadasLista] = useState([]);

    // estado
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    
    // Modal de entrar em equipe
    const [modalEquipeAberto, setModalEquipeAberto] = useState(false);
    const [verificandoEquipe, setVerificandoEquipe] = useState(true);

    // Verifica se o aluno tem equipe ao carregar o dashboard
    useEffect(() => {
        async function verificarEquipeAluno() {
            // Só verifica se for aluno
            if (!usuario?.id || usuario?.role !== "ALUNO") {
                setVerificandoEquipe(false);
                return;
            }

            try {
                // 1. Verifica se há gincana ativa (necessário para listar equipes)
                const gincanaAtiva = await obterGincanaAtiva();
                if (!gincanaAtiva?.id) {
                    // Sem gincana ativa, não abre o modal
                    setVerificandoEquipe(false);
                    return;
                }

                // 2. Busca dados completos do usuário para garantir que temos o equipeId atualizado
                const usuarioCompleto = await obterUsuario(usuario.id);
                
                // 3. Verifica se o aluno não tem equipe
                if (!usuarioCompleto?.equipeId) {
                    // Abre o modal automaticamente
                    setModalEquipeAberto(true);
                }
            } catch (error) {
                console.error("Erro ao verificar equipe do aluno:", error);
                // Em caso de erro, não abre o modal (pode ser um problema temporário)
            } finally {
                setVerificandoEquipe(false);
            }
        }

        verificarEquipeAluno();
    }, [usuario?.id, usuario?.role]);

    // Carrega dados do dashboard
    useEffect(() => {
        let cancelado = false;

        async function carregar() {
            try {
                setErro("");
                setCarregando(true);

                // 1) Gincana ativa
                const ativa = await obterGincanaAtiva(); // null ou { id, nome, ... }
                if (cancelado) return;
                setGincana(ativa);

                if (!ativa?.id) {
                    // sem gincana → zera tudo e sai
                    setQEquipes(0);
                    setQAndamento(0);
                    setQAgendadas(0);
                    setQConcluidas(0);
                    setAndamentoLista([]);
                    setAgendadasLista([]);
                    return;
                }

                const gid = ativa.id;

                // 2) Equipes (somente da gincana ativa e ativas)
                try {
                    const equipes = await listarEquipesPorGincana(gid, { ativo: true });
                    setQEquipes(Array.isArray(equipes) ? equipes.length : 0);
                } catch {
                    setQEquipes(0);
                }

                // 3) Atividades — busca única + filtro no front
                try {
                    const { data: todas } = await api.get(`/atividades/gincana/${gid}`);
                    const norm = (Array.isArray(todas) ? todas : []).map((a) => ({
                        ...a,
                        _status: normalizarStatusAtividade(a),
                    }));

                    const listaAnd = norm.filter((a) => a._status === "EM_ANDAMENTO");
                    const listaAge = norm.filter((a) => a._status === "AGENDADA");
                    const listaCon = norm.filter((a) => a._status === "CONCLUIDA");

                    setQAndamento(listaAnd.length);
                    setQAgendadas(listaAge.length);
                    setQConcluidas(listaCon.length);

                    setAndamentoLista(
                        listaAnd.slice(0, 6).map((a) => ({
                            id: a.id,
                            nome: a.titulo ?? a.nome ?? "Atividade",
                            tipo: a.tipo ?? a.categoria ?? "—",
                        }))
                    );

                    setAgendadasLista(
                        listaAge.slice(0, 6).map((a) => ({
                            id: a.id,
                            nome: a.titulo ?? a.nome ?? "Atividade",
                            tipo: a.tipo ?? a.categoria ?? "—",
                        }))
                    );
                } catch (err) {
                    console.error(err);
                    setQAndamento(0);
                    setQAgendadas(0);
                    setQConcluidas(0);
                    setAndamentoLista([]);
                    setAgendadasLista([]);
                }
            } catch (e) {
                console.error(e);
                setErro("Não foi possível carregar o dashboard.");
            } finally {
                if (!cancelado) setCarregando(false);
            }
        }

        carregar();
        return () => {
            cancelado = true;
        };
    }, []);

    // Handler para quando o aluno entrar em uma equipe
    const handleEntradaConfirmada = (usuarioAtualizado) => {
        // Atualiza o contexto de autenticação
        if (atualizarUsuario) {
            atualizarUsuario(usuarioAtualizado);
        }
        
        // Fecha o modal
        setModalEquipeAberto(false);
        
        // Recarrega a página para atualizar os dados do dashboard
        // Isso garante que tudo seja atualizado corretamente
        window.location.reload();
    };

    const tituloTopo = useMemo(() => {
        if (gincana?.id) return gincana.nome ?? "Gincana Ativa";
        return "Nenhuma gincana em andamento";
    }, [gincana]);

    // -------- render --------
    if (carregando) {
        return (
            <div className="dash">
                <div className="content">
                    <div className="card p-3">Carregando dados do painel...</div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Modal de entrar em equipe - abre automaticamente se aluno não tiver equipe */}
            <ModalEntrarEquipe
                aberta={modalEquipeAberto}
                onClose={() => setModalEquipeAberto(false)}
                onEntradaConfirmada={handleEntradaConfirmada}
            />

            <div className="dash" style={{ overflowX: "hidden" }}>
                <div className="content dash-content">
                    {/* Topo */}
                    <div className="card">
                        <div className="card-body">
                            <h1 className="h1">{tituloTopo}</h1>
                            <p className="muted">
                                {gincana?.id
                                    ? "Acompanhe o andamento da gincana"
                                    : "Crie/ative uma gincana para começar"}
                            </p>
                        </div>
                    </div>

                    {erro && <div className="alert-erro">{erro}</div>}

                    {/* KPIs */}
                    <section className="metrics">
                        <Kpi icone="👥" titulo="Equipes Participantes" valor={qEquipes} bg="bg-blue" />
                        <Kpi icone="⏳" titulo="Tarefas em Andamento" valor={qAndamento} bg="bg-green" />
                        <Kpi icone="🗓️" titulo="Tarefas Agendadas" valor={qAgendadas} bg="bg-orange" />
                        <Kpi icone="✅" titulo="Atividades Concluídas" valor={qConcluidas} bg="bg-purple" />
                    </section>

                    {/* Dupla de listas - AGORA USANDO CSS */}
                    <div className="listas-duplas">
                        <ListaSimples
                            titulo={
                                <span className="lista-titulo-icone">
                                    <span className="emoji">⚡</span> Atividades em Andamento
                                </span>
                            }
                            itens={andamentoLista}
                            vazio="Nenhuma atividade em andamento"
                            destaque="andamento"
                        />

                        <ListaSimples
                            titulo={
                                <span className="lista-titulo-icone">
                                    <span className="emoji">📅</span> Atividades Agendadas
                                </span>
                            }
                            itens={agendadasLista}
                            vazio="Nenhuma atividade agendada"
                            destaque="agendada"
                        />
                    </div>

                    {/* Ranking */}
                    <section className="grid-unica">
                        <RankingInlineGincana />
                    </section>
                </div>
            </div>
        </>
    );
}